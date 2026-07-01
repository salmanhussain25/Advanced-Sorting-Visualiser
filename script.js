

// =====================================================================
// 1. CORE DOM ELEMENTS & SELECTION
// =====================================================================
const arrayContainer = document.getElementById("arrayContainer");
const generateArrayButton = document.getElementById("generateArray");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const algorithmSelect = document.getElementById("algorithm");
const sortButton = document.getElementById("sort");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const customArrayInput = document.getElementById("customArray");
const useCustomArrayButton = document.getElementById("useCustomArray");
const algorithmDescription = document.getElementById("algorithmDescription");
const comparisonsDisplay = document.getElementById("comparisons");
const swapsDisplay = document.getElementById("swaps");
const timeDisplay = document.getElementById("time");
const sizeInput = document.getElementById("sizeInput");

// Dual Comparison Elements
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

// Shared Global App State
let array = [];
let arraySize = sizeSlider ? parseInt(sizeSlider.value) : 30;
let delay = 100 - (speedSlider ? parseInt(speedSlider.value) : 50);
let isSorting = false;
let isComparing = false;
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
// 2. REUSABLE SYSTEM CORE COMPONENT: RENDERING GRAPHICS
// =====================================================================
// We updated your main component logic so it can render to ANY window container automatically
function renderArray(targetContainer = arrayContainer, targetArray = array, highlightIndices = [], swapIndices = [], sortedIndices = []) {
  if (!targetContainer) return;
  targetContainer.innerHTML = "";
  
  for (let i = 0; i < targetArray.length; i++) {
    const bar = document.createElement("div");
    bar.className = "arrayBar";
    bar.style.height = `${targetArray[i]}%`;
    bar.style.flex = "1";
    bar.style.margin = "0 1px";
    
    if (highlightIndices.includes(i)) bar.classList.add("comparing");
    if (swapIndices.includes(i)) bar.classList.add("swapping");
    if (sortedIndices.includes(i)) bar.classList.add("sorted");
    
    targetContainer.appendChild(bar);
  }
}

function generateArray() {
  array = [];
  for (let i = 0; i < arraySize; i++) {
    array.push(Math.floor(Math.random() * 100) + 1);
  }
  renderArray(arrayContainer, array);
}

// Sound System Safety Configuration
const swapSound = new Audio("swap.wav");
const compareSound = new Audio("compare.wav");

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
  isComparing = false;
  isPaused = false;
  comparisons = 0;
  swaps = 0;
  if (comparisonsDisplay) comparisonsDisplay.textContent = comparisons;
  if (swapsDisplay) swapsDisplay.textContent = swaps;
  if (timeDisplay) timeDisplay.textContent = 0;
  generateArray();
}

// =====================================================================
// 3. CORE ENGINES FOR BOTH SINGLE INTERFACE & DUAL RUNNER
// =====================================================================
async function sharedSwap(engineState, i, j) {
  [engineState.arrayData[i], engineState.arrayData[j]] = [engineState.arrayData[j], engineState.arrayData[i]];
  engineState.swapsCount++;
  if (engineState.swapDisplayElement) engineState.swapDisplayElement.textContent = engineState.swapsCount;
  renderArray(engineState.viewContainer, engineState.arrayData, [], [i, j]);
  if (engineState.isMainEngine) swapSound.play().catch(() => {});
  await sleep(delay);
}

// --- MASTER SORT PIPELINES ---
async function runBubbleSort(state) {
  let arr = state.arrayData;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (isPaused && state.isMainEngine) await pause();
      state.compCount++; if (state.compDisplayElement) state.compDisplayElement.textContent = state.compCount;
      renderArray(state.viewContainer, arr, [j, j + 1]);
      if (state.isMainEngine) compareSound.play().catch(() => {});
      await sleep(delay);
      if (arr[j] > arr[j + 1]) await sharedSwap(state, j, j + 1);
    }
  }
}

async function runSelectionSort(state) {
  let arr = state.arrayData;
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (isPaused && state.isMainEngine) await pause();
      state.compCount++; if (state.compDisplayElement) state.compDisplayElement.textContent = state.compCount;
      renderArray(state.viewContainer, arr, [j, minIdx]);
      if (state.isMainEngine) compareSound.play().catch(() => {});
      await sleep(delay);
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) await sharedSwap(state, i, minIdx);
  }
}

async function runInsertionSort(state) {
  let arr = state.arrayData;
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i]; let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      if (isPaused && state.isMainEngine) await pause();
      state.compCount++; if (state.compDisplayElement) state.compDisplayElement.textContent = state.compCount;
      renderArray(state.viewContainer, arr, [j, j + 1]);
      if (state.isMainEngine) compareSound.play().catch(() => {});
      await sleep(delay);
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    renderArray(state.viewContainer, arr, [], [j + 1]);
    await sleep(delay);
  }
}

async function runMergeSort(state, low = 0, high = state.arrayData.length - 1) {
  if (low < high) {
    const mid = Math.floor((low + high) / 2);
    await runMergeSort(state, low, mid);
    await runMergeSort(state, mid + 1, high);
    await executeMerge(state, low, mid, high);
  }
}
async function executeMerge(state, low, mid, high) {
  let arr = state.arrayData; const temp = []; let i = low, j = mid + 1;
  while (i <= mid && j <= high) {
    if (isPaused && state.isMainEngine) await pause();
    state.compCount++; if (state.compDisplayElement) state.compDisplayElement.textContent = state.compCount;
    renderArray(state.viewContainer, arr, [i, j]);
    if (state.isMainEngine) compareSound.play().catch(() => {});
    await sleep(delay);
    if (arr[i] <= arr[j]) temp.push(arr[i++]);
    else temp.push(arr[j++]);
  }
  while (i <= mid) temp.push(arr[i++]);
  while (j <= high) temp.push(arr[j++]);
  for (let k = low; k <= high; k++) {
    arr[k] = temp[k - low];
    renderArray(state.viewContainer, arr, [], [k]);
    await sleep(delay);
  }
}

async function runQuickSort(state, low = 0, high = state.arrayData.length - 1) {
  if (low < high) {
    const pivotIdx = await executePartition(state, low, high);
    await runQuickSort(state, low, pivotIdx - 1);
    await runQuickSort(state, pivotIdx + 1, high);
  }
}
async function executePartition(state, low, high) {
  let arr = state.arrayData; const pivot = arr[high]; let i = low - 1;
  for (let j = low; j < high; j++) {
    if (isPaused && state.isMainEngine) await pause();
    state.compCount++; if (state.compDisplayElement) state.compDisplayElement.textContent = state.compCount;
    renderArray(state.viewContainer, arr, [j, high]);
    if (state.isMainEngine) compareSound.play().catch(() => {});
    await sleep(delay);
    if (arr[j] < pivot) { i++; await sharedSwap(state, i, j); }
  }
  await sharedSwap(state, i + 1, high);
  return i + 1;
}

async function runHeapSort(state) {
  let arr = state.arrayData; const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await executeHeapify(state, n, i);
  for (let i = n - 1; i > 0; i--) {
    await sharedSwap(state, 0, i);
    await executeHeapify(state, i, 0);
  }
}
async function executeHeapify(state, n, i) {
  let arr = state.arrayData; let largest = i; const left = 2 * i + 1; const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) { await sharedSwap(state, i, largest); await executeHeapify(state, n, largest); }
}

async function orchestrateRouting(algoName, engineState) {
  switch (algoName) {
    case "bubbleSort": await runBubbleSort(engineState); break;
    case "selectionSort": await runSelectionSort(engineState); break;
    case "insertionSort": await runInsertionSort(engineState); break;
    case "mergeSort": await runMergeSort(engineState); break;
    case "quickSort": await runQuickSort(engineState); break;
    case "heapSort": await runHeapSort(engineState); break;
  }
  renderArray(engineState.viewContainer, engineState.arrayData, [], [], Array.from({ length: engineState.arrayData.length }, (_, i) => i));
}

// =====================================================================
// 4. PARALLEL COMPARISON ACTION DISPATCHER
// =====================================================================
if (startComparisonBtn) {
  startComparisonBtn.addEventListener("click", async () => {
    if (isComparing || isSorting) return;
    
    // Safety check: verify base workspace state has items inside it
    if (!array || array.length === 0) generateArray();

    isComparing = true;
    startComparisonBtn.disabled = true;

    // Zero out layout displays
    if (compComparisons1Display) compComparisons1Display.textContent = 0;
    if (compComparisons2Display) compComparisons2Display.textContent = 0;
    if (compSwaps1Display) compSwaps1Display.textContent = 0;
    if (compSwaps2Display) compSwaps2Display.textContent = 0;

    // SETUP SEPARATE STATES BUT MAP THEM INTO THE SAME MASTER GRAPHICS SYSTEM
    let engine1State = {
      isMainEngine: false,
      arrayData: [...array],
      viewContainer: compContainer1,
      compCount: 0,
      swapsCount: 0,
      compDisplayElement: compComparisons1Display,
      swapDisplayElement: compSwaps1Display
    };

    let engine2State = {
      isMainEngine: false,
      arrayData: [...array],
      viewContainer: compContainer2,
      compCount: 0,
      swapsCount: 0,
      compDisplayElement: compComparisons2Display,
      swapDisplayElement: compSwaps2Display
    };

    // Render baseline state to custom nodes
    renderArray(compContainer1, engine1State.arrayData);
    renderArray(compContainer2, engine2State.arrayData);

    const targetAlgo1 = compAlgo1Select ? compAlgo1Select.value : "bubbleSort";
    const targetAlgo2 = compAlgo2Select ? compAlgo2Select.value : "selectionSort";

    try {
      // EXECUTE BOTH SIDE-BY-SIDE SIMULTANEOUSLY 
      await Promise.all([
        orchestrateRouting(targetAlgo1, engine1State),
        orchestrateRouting(targetAlgo2, engine2State)
      ]);
    } catch (err) {
      console.error("Parallel asynchronous engine error execution crash:", err);
    } finally {
      isComparing = false;
      startComparisonBtn.disabled = false;
    }
  });
}

// =====================================================================
// 5. STANDARD CONTROL BOARD HANDLING
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

    let mainEngineState = {
      isMainEngine: true,
      arrayData: array,
      viewContainer: arrayContainer,
      compCount: comparisons,
      swapsCount: swaps,
      compDisplayElement: comparisonsDisplay,
      swapDisplayElement: swapsDisplay
    };
    
    await orchestrateRouting(algorithmSelect.value, mainEngineState);
    
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
if (resetButton) resetButton.addEventListener("click", reset);

if (useCustomArrayButton) {
  useCustomArrayButton.addEventListener("click", () => {
    if (isSorting || isComparing) return;
    if (!customArrayInput || !customArrayInput.value.trim()) return;
    
    const customArray = customArrayInput.value.split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));
      
    if (customArray.length >= 5 && customArray.length <= 100) {
      array = customArray;
      arraySize = array.length;
      if (sizeSlider) sizeSlider.value = arraySize;
      if (sizeInput) sizeInput.value = arraySize;
      renderArray(arrayContainer, array);
    } else {
      alert("Custom array must contain between 5 and 100 valid numbers.");
    }
  });
}

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

// Base Initializer
try {
  generateArray();
} catch (e) {
  console.warn("Baseline array render skipped.", e);
}
if (algorithmSelect && algorithmDescription) {
  algorithmDescription.textContent = algorithmDescriptions[algorithmSelect.value];
}
