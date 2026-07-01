// =====================================================================
// 1. CORE DOM ELEMENTS & SAFETY WRAPPERS
// =====================================================================
const arrayContainer = document.getElementById("arrayContainer");
const generateArrayButton = document.getElementById("generateArray");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const algorithmSelect = document.getElementById("algorithm");
const sortButton = document.getElementById("sort");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const stepButton = document.getElementById("step");
const customArrayInput = document.getElementById("customArray");
const useCustomArrayButton = document.getElementById("useCustomArray");
const algorithmDescription = document.getElementById("algorithmDescription");
const comparisonsDisplay = document.getElementById("comparisons");
const swapsDisplay = document.getElementById("swaps");
const timeDisplay = document.getElementById("time");
const sizeInput = document.getElementById("sizeInput");

// Core App State Variables
let array = [];
let arraySize = sizeSlider ? parseInt(sizeSlider.value) : 30;
let delay = 100 - (speedSlider ? parseInt(speedSlider.value) : 50);
let isSorting = false;
let isPaused = false;
let comparisons = 0;
let swaps = 0;
let startTime;

const algorithmDescriptions = {
  bubbleSort: "Bubble Sort repeatedly swaps adjacent elements if they are in the wrong order.",
  selectionSort: "Selection Sort selects the smallest element and swaps it with the first unsorted element.",
  insertionSort: "Insertion Sort builds the final sorted array one element at a time.",
  mergeSort: "Merge Sort divides the array into halves, sorts them, and merges them.",
  quickSort: "Quick Sort picks a pivot and partitions the array around the pivot.",
  heapSort: "Heap Sort builds a heap and repeatedly extracts the maximum element.",
};

// =====================================================================
// 2. PRIMARY WINDOW ARRAY LOGIC
// =====================================================================
function generateArray() {
  array = [];
  for (let i = 0; i < arraySize; i++) {
    array.push(Math.floor(Math.random() * 100) + 1);
  }
  renderArray();
}

function renderArray(highlightIndices = [], swapIndices = [], sortedIndices = []) {
  if (!arrayContainer) return;
  arrayContainer.innerHTML = "";
  for (let i = 0; i < array.length; i++) {
    const bar = document.createElement("div");
    bar.className = "arrayBar";
    bar.style.height = `${array[i]}%`;
    if (highlightIndices.includes(i)) bar.classList.add("comparing");
    if (swapIndices.includes(i)) bar.classList.add("swapping");
    if (sortedIndices.includes(i)) bar.classList.add("sorted");
    arrayContainer.appendChild(bar);
  }
}

// Audio Handling (Safely ignores errors if audio files aren't found)
const swapSound = new Audio("swap.wav");
const compareSound = new Audio("compare.wav");

async function swap(i, j) {
  [array[i], array[j]] = [array[j], array[i]];
  swaps++;
  if (swapsDisplay) swapsDisplay.textContent = swaps;
  renderArray([], [i, j]);
  swapSound.play().catch(() => {}); 
  await sleep(delay);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pause() {
  return new Promise((resolve) => {
    const resumeButton = document.getElementById("pause");
    if (!resumeButton) return resolve();
    resumeButton.textContent = "Resume";
    const resumeHandler = () => {
      isPaused = false;
      resumeButton.textContent = "Pause";
      resolve();
      resumeButton.removeEventListener("click", resumeHandler);
    };
    resumeButton.addEventListener("click", resumeHandler);
  });
}

function reset() {
  isSorting = false;
  isPaused = false;
  comparisons = 0;
  swaps = 0;
  if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
  if (swapsDisplay) swapsDisplay.textContent = swaps;
  if (timeDisplay) timeDisplay.textContent = 0;
  generateArray();
}

// =====================================================================
// 3. MAIN INTERFACE ALGORITHMS
// =====================================================================
async function bubbleSort() {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (isPaused) await pause();
      comparisons++;
      if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
      renderArray([j, j + 1]);
      compareSound.play().catch(() => {});
      await sleep(delay);
      if (array[j] > array[j + 1]) await swap(j, j + 1);
    }
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

async function selectionSort() {
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (isPaused) await pause();
      comparisons++;
      if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
      renderArray([j, minIndex]);
      compareSound.play().catch(() => {});
      await sleep(delay);
      if (array[j] < array[minIndex]) minIndex = j;
    }
    if (minIndex !== i) await swap(i, minIndex);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      if (isPaused) await pause();
      comparisons++;
      if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
      renderArray([j, j + 1]);
      compareSound.play().catch(() => {});
      await sleep(delay);
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = key;
    renderArray([], [], [j + 1]);
    await sleep(delay);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}

async function mergeSort() {
  await mergeSortHelper(0, array.length - 1);
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}
async function mergeSortHelper(low, high) {
  if (low < high) {
    const mid = Math.floor((low + high) / 2);
    await mergeSortHelper(low, mid);
    await mergeSortHelper(mid + 1, high);
    await merge(low, mid, high);
  }
}
async function merge(low, mid, high) {
  const temp = [];
  let i = low, j = mid + 1;
  while (i <= mid && j <= high) {
    if (isPaused) await pause();
    comparisons++;
    if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
    renderArray([i, j]);
    compareSound.play().catch(() => {});
    await sleep(delay);
    if (array[i] <= array[j]) temp.push(array[i++]);
    else temp.push(array[j++]);
  }
  while (i <= mid) temp.push(array[i++]);
  while (j <= high) temp.push(array[j++]);
  for (let k = low; k <= high; k++) {
    array[k] = temp[k - low];
    renderArray([], [], [k]);
    await sleep(delay);
  }
}

async function quickSort() {
  await quickSortHelper(0, array.length - 1);
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}
async function quickSortHelper(low, high) {
  if (low < high) {
    const pivotIndex = await partition(low, high);
    await quickSortHelper(low, pivotIndex - 1);
    await quickSortHelper(pivotIndex + 1, high);
  }
}
async function partition(low, high) {
  const pivot = array[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (isPaused) await pause();
    comparisons++;
    if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
    renderArray([j, high]);
    compareSound.play().catch(() => {});
    await sleep(delay);
    if (array[j] < pivot) {
      i++;
      await swap(i, j);
    }
  }
  await swap(i + 1, high);
  return i + 1;
}

async function heapSort() {
  const n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    await swap(0, i);
    await heapify(i, 0);
  }
  renderArray([], [], Array.from({ length: array.length }, (_, i) => i));
}
async function heapify(n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && array[left] > array[largest]) largest = left;
  if (right < n && array[right] > array[largest]) largest = right;
  if (largest !== i) {
    await swap(i, largest);
    await heapify(n, largest);
  }
}

// =====================================================================
// 4. THEME CONTROLS (CRASH-PROOFED)
// =====================================================================
const themeToggle = document.getElementById("themeToggle");
const gradientTheme = document.getElementById("gradientTheme");
const neonTheme = document.getElementById("neonTheme");
const woodenTheme = document.getElementById("woodenTheme");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.querySelector("header")?.classList.toggle("dark-mode");
    document.querySelector("footer")?.classList.toggle("dark-mode");
  });
}
if (gradientTheme) {
  gradientTheme.addEventListener("click", () => {
    document.body.classList.remove("dark-mode", "neon-mode", "wooden-mode");
    document.body.classList.add("gradient-mode");
  });
}
if (neonTheme) {
  neonTheme.addEventListener("click", () => {
    document.body.classList.remove("dark-mode", "gradient-mode", "wooden-mode");
    document.body.classList.add("neon-mode");
  });
}
if (woodenTheme) {
  woodenTheme.addEventListener("click", () => {
    document.body.classList.remove("dark-mode", "gradient-mode", "neon-mode");
    document.body.classList.add("wooden-mode");
  });
}

// =====================================================================
// 5. MAIN EVENT LISTENERS SETUP
// =====================================================================
if (generateArrayButton) generateArrayButton.addEventListener("click", generateArray);

if (sizeSlider) {
  sizeSlider.addEventListener("input", () => {
    arraySize = parseInt(sizeSlider.value);
    if (sizeInput) sizeInput.value = arraySize;
    generateArray();
  });
}
if (sizeInput) {
  sizeInput.addEventListener("input", () => {
    let val = parseInt(sizeInput.value);
    if (val >= 5 && val <= 100) {
      arraySize = val;
      if (sizeSlider) sizeSlider.value = arraySize;
      generateArray();
    }
  });
}
if (speedSlider) {
  speedSlider.addEventListener("input", () => {
    delay = 100 - parseInt(speedSlider.value);
  });
}
if (algorithmSelect) {
  algorithmSelect.addEventListener("change", () => {
    if (algorithmDescription) algorithmDescription.textContent = algorithmDescriptions[algorithmSelect.value];
  });
}
if (sortButton) {
  sortButton.addEventListener("click", async () => {
    if (isSorting || isComparing) return;
    isSorting = true;
    comparisons = 0; swaps = 0;
    if (timeDisplay) timeDisplay.textContent = 0;
    if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
    if (swapsDisplay) swapsDisplay.textContent = swaps;
    startTime = performance.now();
    
    switch (algorithmSelect.value) {
      case "bubbleSort": await bubbleSort(); break;
      case "selectionSort": await selectionSort(); break;
      case "insertionSort": await insertionSort(); break;
      case "mergeSort": await mergeSort(); break;
      case "quickSort": await quickSort(); break;
      case "heapSort": await heapSort(); break;
    }
    const endTime = performance.now();
    if (timeDisplay) timeDisplay.textContent = Math.floor(endTime - startTime);
    isSorting = false;
  });
}
if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    if (isSorting) {
      isPaused = !isPaused;
      pauseButton.textContent = isPaused ? "Resume" : "Pause";
    }
  });
}
if (resetButton) resetButton.addEventListener("click", () => { reset(); });

if (useCustomArrayButton) {
  useCustomArrayButton.addEventListener("click", () => {
    if (isSorting) return;
    const customArray = customArrayInput.value.split(",").map((num) => parseInt(num.trim())).filter((num) => !isNaN(num));
    if (customArray.length >= 5 && customArray.length <= 100) {
      array = customArray;
      arraySize = array.length;
      if (sizeSlider) sizeSlider.value = arraySize;
      if (sizeInput) sizeInput.value = arraySize;
      renderArray();
    } else {
      alert("Custom array must have between 5 and 100 elements.");
    }
  });
}

// =====================================================================
// 6. REAL-TIME COMPARISON VISUALIZER LOGIC (CRASH-PROOF)
// =====================================================================
const compAlgo1Select = document.getElementById("compAlgo1");
const compAlgo2Select = document.getElementById("compAlgo2");
const startComparisonBtn = document.getElementById("startComparisonBtn");
const compTitle1 = document.getElementById("compTitle1");
const compTitle2 = document.getElementById("compTitle2");
const compContainer1 = document.getElementById("compContainer1");
const compContainer2 = document.getElementById("compContainer2");
const compComparisons1Display = document.getElementById("compComparisons1");
const compComparisons2Display = document.getElementById("compComparisons2");
const compSwaps1Display = document.getElementById("compSwaps1");
const compSwaps2Display = document.getElementById("compSwaps2");

let isComparing = false;

if (compAlgo1Select) {
  compAlgo1Select.addEventListener("change", () => {
    if (compTitle1) compTitle1.textContent = compAlgo1Select.options[compAlgo1Select.selectedIndex].text;
  });
}
if (compAlgo2Select) {
  compAlgo2Select.addEventListener("change", () => {
    if (compTitle2) compTitle2.textContent = compAlgo2Select.options[compAlgo2Select.selectedIndex].text;
  });
}

function renderCompArray(container, TargetArray, highlightIndices = [], swapIndices = [], sortedIndices = []) {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < TargetArray.length; i++) {
    const bar = document.createElement("div");
    bar.className = "arrayBar";
    bar.style.height = `${TargetArray[i]}%`;
    bar.style.flex = "1";
    bar.style.margin = "0 1px";
    if (highlightIndices.includes(i)) bar.classList.add("comparing");
    if (swapIndices.includes(i)) bar.classList.add("swapping");
    if (sortedIndices.includes(i)) bar.classList.add("sorted");
    container.appendChild(bar);
  }
}

if (startComparisonBtn) {
  startComparisonBtn.addEventListener("click", async () => {
    if (isComparing || isSorting) return; 
    isComparing = true;
    startComparisonBtn.disabled = true;

    if (!array || array.length === 0) {
      generateArray();
    }

    const arrayCopy1 = [...array];
    const arrayCopy2 = [...array];

    let stats1 = { comparisons: 0, swaps: 0, array: arrayCopy1, container: compContainer1, compDisplay: compComparisons1Display, swapDisplay: compSwaps1Display };
    let stats2 = { comparisons: 0, swaps: 0, array: arrayCopy2, container: compContainer2, compDisplay: compComparisons2Display, swapDisplay: compSwaps2Display };

    if (compComparisons1Display) compComparisons1Display.textContent = 0;
    if (compComparisons2Display) compComparisons2Display.textContent = 0;
    if (compSwaps1Display) compSwaps1Display.textContent = 0;
    if (compSwaps2Display) compSwaps2Display.textContent = 0;

    if (compContainer1) renderCompArray(compContainer1, stats1.array);
    if (compContainer2) renderCompArray(compContainer2, stats2.array);

    const a1 = compAlgo1Select ? compAlgo1Select.value : "bubbleSort";
    const a2 = compAlgo2Select ? compAlgo2Select.value : "selectionSort";

    try {
      await Promise.all([
        executeCompSort(a1, stats1),
        executeCompSort(a2, stats2)
      ]);
    } catch (err) {
      console.error("Comparison run caught an error:", err);
    } finally {
      isComparing = false;
      startComparisonBtn.disabled = false;
    }
  });
}

async function executeCompSort(algoName, stats) {
  switch (algoName) {
    case "bubbleSort": await compBubbleSort(stats); break;
    case "selectionSort": await compSelectionSort(stats); break;
    case "insertionSort": await compInsertionSort(stats); break;
    case "mergeSort": await compMergeSort(stats, 0, stats.array.length - 1); break;
    case "quickSort": await compQuickSort(stats, 0, stats.array.length - 1); break;
    case "heapSort": await compHeapSort(stats); break;
  }
  renderCompArray(stats.container, stats.array, [], [], Array.from({ length: stats.array.length }, (_, i) => i));
}

async function compSwap(stats, i, j) {
  [stats.array[i], stats.array[j]] = [stats.array[j], stats.array[i]];
  stats.swaps++;
  if (stats.swapDisplay) stats.swapDisplay.textContent = stats.swaps;
  renderCompArray(stats.container, stats.array, [], [i, j]);
  await sleep(delay);
}

// --- ISOLATED REAL-TIME DUAL PIPELINES ---
async function compBubbleSort(stats) {
  let arr = stats.array;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      stats.comparisons++; if (stats.compDisplay) stats.compDisplay.textContent = stats.comparisons;
      renderCompArray(stats.container, arr, [j, j + 1]);
      await sleep(delay);
      if (arr[j] > arr[j + 1]) await compSwap(stats, j, j + 1);
    }
  }
}

async function compSelectionSort(stats) {
  let arr = stats.array;
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      stats.comparisons++; if (stats.compDisplay) stats.compDisplay.textContent = stats.comparisons;
      renderCompArray(stats.container, arr, [j, minIdx]);
      await sleep(delay);
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) await compSwap(stats, i, minIdx);
  }
}

async function compInsertionSort(stats) {
  let arr = stats.array;
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      stats.comparisons++; if (stats.compDisplay) stats.compDisplay.textContent = stats.comparisons;
      renderCompArray(stats.container, arr, [j, j + 1]);
      await sleep(delay);
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    renderCompArray(stats.container, arr, [], [j + 1]);
    await sleep(delay);
  }
}

async function compMergeSort(stats, low, high) {
  if (low < high) {
    const mid = Math.floor((low + high) / 2);
    await compMergeSort(stats, low, mid);
    await compMergeSort(stats, mid + 1, high);
    await compMerge(stats, low, mid, high);
  }
}
async function compMerge(stats, low, mid, high) {
  let arr = stats.array; const temp = []; let i = low, j = mid + 1;
  while (i <= mid && j <= high) {
    stats.comparisons++; if (stats.compDisplay) stats.compDisplay.textContent = stats.comparisons;
    renderCompArray(stats.container, arr, [i, j]);
    await sleep(delay);
    if (arr[i] <= arr[j]) temp.push(arr[i++]);
    else temp.push(arr[j++]);
  }
  while (i <= mid) temp.push(arr[i++]);
  while (j <= high) temp.push(arr[j++]);
  for (let k = low; k <= high; k++) {
    arr[k] = temp[k - low];
    renderCompArray(stats.container, arr, [], [k]);
    await sleep(delay);
  }
}

async function compQuickSort(stats, low, high) {
  if (low < high) {
    const pivotIndex = await compPartition(stats, low, high);
    await compQuickSort(stats, low, pivotIndex - 1);
    await compQuickSort(stats, pivotIndex + 1, high);
  }
}
async function compPartition(stats, low, high) {
  let arr = stats.array; const pivot = arr[high]; let i = low - 1;
  for (let j = low; j < high; j++) {
    stats.comparisons++; if (stats.compDisplay) stats.compDisplay.textContent = stats.comparisons;
    renderCompArray(stats.container, arr, [j, high]);
    await sleep(delay);
    if (arr[j] < pivot) { i++; await compSwap(stats, i, j); }
  }
  await compSwap(stats, i + 1, high);
  return i + 1;
}

async function compHeapSort(stats) {
  let arr = stats.array; const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await compHeapify(stats, n, i);
  for (let i = n - 1; i > 0; i--) {
    await compSwap(stats, 0, i);
    await compHeapify(stats, i, 0);
  }
}
async function compHeapify(stats, n, i) {
  let arr = stats.array; let largest = i; const left = 2 * i + 1; const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) { await compSwap(stats, i, largest); await compHeapify(stats, n, largest); }
}

// =====================================================================
// 7. BASE APPLICATION INITIALIZATION
// =====================================================================
try {
  generateArray();
} catch (e) {
  console.warn("Initial default array building bypassed. Container element might be missing.", e);
}

if (algorithmSelect && algorithmDescription) {
  algorithmDescription.textContent = algorithmDescriptions[algorithmSelect.value];
}
