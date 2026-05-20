import type { AlgorithmVisualization, PracticeConfig, PracticeTestCase } from "@/lib/types";

export interface Blind75Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  leetcodeSlug: string;
  practice: PracticeConfig;
  visualization: AlgorithmVisualization;
}

type ProblemSeed = {
  id: string;
  title: string;
  difficulty: Blind75Problem["difficulty"];
  category: string;
  leetcodeSlug: string;
  functionName: string;
  args: string;
  prompt: string;
  expected: unknown;
  sampleArgs: unknown[];
  constraints?: string[];
  hints?: string[];
};

const defaultHints = [
  "Restate the input and output before writing code.",
  "Name the state you need to carry through the loop or recursion.",
  "Run the sample, then add one edge case that would break a shallow solution."
];

const categoryVisuals: Record<
  string,
  Pick<AlgorithmVisualization, "pattern" | "state" | "flow" | "complexity" | "answerPseudocode">
> = {
  "Arrays & Hashing": {
    pattern: "Hash-backed lookup",
    state: [
      { name: "index / item", purpose: "The current element being inspected." },
      { name: "memory", purpose: "A set or dictionary that makes prior values searchable." },
      { name: "answer", purpose: "The grouped, counted, or matched result built from memory." }
    ],
    flow: [
      { title: "Normalize the input", detail: "Decide what key represents the thing you are searching or grouping by." },
      { title: "Scan once", detail: "Update memory while preserving enough information to answer immediately." },
      { title: "Resolve from memory", detail: "Return the match, grouping, count, or derived array once the invariant is satisfied." }
    ],
    complexity: { time: "Usually O(n)", space: "Usually O(n)" },
    answerPseudocode: ["create memory", "for each item in input: update or query memory", "return the result described by memory"]
  },
  "Two Pointers": {
    pattern: "Converging pointers",
    state: [
      { name: "left", purpose: "Tracks the lower or earlier candidate." },
      { name: "right", purpose: "Tracks the upper or later candidate." },
      { name: "best", purpose: "Stores the best valid answer seen while pointers move." }
    ],
    flow: [
      { title: "Prepare order", detail: "Sort or clean the input when the pointer logic depends on order." },
      { title: "Compare both ends", detail: "Use the current pair to update the answer or decide which side is impossible." },
      { title: "Move one pointer", detail: "Discard the side that cannot improve the answer." }
    ],
    complexity: { time: "O(n) after any sorting", space: "O(1) besides output" },
    answerPseudocode: ["left = start, right = end", "while left < right: evaluate pair", "move the pointer that cannot help anymore"]
  },
  "Sliding Window": {
    pattern: "Elastic window",
    state: [
      { name: "left / right", purpose: "Bounds of the current candidate window." },
      { name: "counts", purpose: "Frequencies or requirements inside the window." },
      { name: "best", purpose: "The best valid window length or substring so far." }
    ],
    flow: [
      { title: "Expand right", detail: "Include a new element and update window state." },
      { title: "Repair validity", detail: "Move left while the current window violates the rule." },
      { title: "Record best", detail: "When valid, update the best length, score, or substring." }
    ],
    complexity: { time: "O(n)", space: "O(k) for tracked symbols" },
    answerPseudocode: ["for right in range(n): add input[right]", "while window invalid: remove input[left]; left += 1", "update answer from current window"]
  },
  Stack: {
    pattern: "Last-in, first-out matching",
    state: [
      { name: "stack", purpose: "Stores unresolved opening symbols or candidates." },
      { name: "current", purpose: "The token currently being matched." },
      { name: "valid", purpose: "Whether every close has matched the latest open." }
    ],
    flow: [
      { title: "Push opens", detail: "When a new unresolved item appears, put it on top." },
      { title: "Match closes", detail: "A close must match and remove the most recent open." },
      { title: "Finish empty", detail: "A valid sequence leaves no unresolved items." }
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    answerPseudocode: ["for token in input: push opens, pop matching closes", "if mismatch: return False", "return stack is empty"]
  },
  "Binary Search": {
    pattern: "Halving a sorted decision space",
    state: [
      { name: "low / high", purpose: "The remaining candidate range." },
      { name: "mid", purpose: "The probe that splits the search space." },
      { name: "condition", purpose: "The comparison that tells which half survives." }
    ],
    flow: [
      { title: "Choose mid", detail: "Probe the center of the current range." },
      { title: "Classify half", detail: "Use sortedness or monotonicity to identify the impossible half." },
      { title: "Shrink range", detail: "Move low or high until the target or boundary is found." }
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    answerPseudocode: ["while low <= high: mid = center", "if mid satisfies answer: return/update", "discard the impossible half"]
  },
  "Linked List": {
    pattern: "Pointer rewiring",
    state: [
      { name: "prev / curr", purpose: "The local links currently being rewired." },
      { name: "fast / slow", purpose: "Used to find middles, cycles, or offset positions." },
      { name: "dummy", purpose: "Simplifies edge cases at the head." }
    ],
    flow: [
      { title: "Protect the head", detail: "Use a dummy or previous pointer when head might change." },
      { title: "Walk carefully", detail: "Advance pointers while preserving the next node before rewiring." },
      { title: "Reconnect", detail: "Return the new head or transformed value order." }
    ],
    complexity: { time: "O(n)", space: "O(1) or O(n) for heap/output variants" },
    answerPseudocode: ["keep references before changing links", "move pointers in a deliberate order", "return the transformed list representation"]
  },
  Trees: {
    pattern: "Recursive tree decisions",
    state: [
      { name: "node", purpose: "The current subtree root." },
      { name: "left / right", purpose: "Results returned from child subtrees." },
      { name: "bounds / best", purpose: "Extra context carried through recursion." }
    ],
    flow: [
      { title: "Handle empty subtree", detail: "Return the base value for null children." },
      { title: "Ask children", detail: "Recursively compute what each child contributes." },
      { title: "Combine", detail: "Use child results and current value to return the parent answer." }
    ],
    complexity: { time: "O(n)", space: "O(h) recursion stack" },
    answerPseudocode: ["def dfs(node): handle empty", "left = dfs(node.left); right = dfs(node.right)", "combine child answers with node"]
  },
  Tries: {
    pattern: "Prefix tree traversal",
    state: [
      { name: "node", purpose: "The trie node for the current prefix." },
      { name: "children", purpose: "Edges to next characters." },
      { name: "word flag", purpose: "Marks whether a full word ends here." }
    ],
    flow: [
      { title: "Insert characters", detail: "Create child nodes as each character extends the prefix." },
      { title: "Traverse query", detail: "Follow existing child edges for each character." },
      { title: "Resolve wildcard/prefix", detail: "Return based on word flags or DFS through wildcard branches." }
    ],
    complexity: { time: "O(L) per word/query, plus wildcard branching", space: "O(total characters)" },
    answerPseudocode: ["walk characters from root", "create or follow child nodes", "use terminal flags to answer searches"]
  },
  "Heap / Priority Queue": {
    pattern: "Two-heap balance",
    state: [
      { name: "small heap", purpose: "Keeps the lower half." },
      { name: "large heap", purpose: "Keeps the upper half." },
      { name: "balance", purpose: "Ensures median is at one or two heap tops." }
    ],
    flow: [
      { title: "Insert into a side", detail: "Place the new value into the appropriate half." },
      { title: "Rebalance", detail: "Move heap tops until sizes differ by at most one." },
      { title: "Read median", detail: "Use one heap top or average both tops." }
    ],
    complexity: { time: "O(log n) insert, O(1) median", space: "O(n)" },
    answerPseudocode: ["push number into one heap", "rebalance sizes and ordering", "median comes from heap tops"]
  },
  Backtracking: {
    pattern: "Choice tree search",
    state: [
      { name: "path", purpose: "The partial answer currently being explored." },
      { name: "remaining", purpose: "What still needs to be matched or summed." },
      { name: "visited", purpose: "Prevents reusing invalid cells or choices." }
    ],
    flow: [
      { title: "Choose", detail: "Add one candidate to the current path." },
      { title: "Explore", detail: "Recurse while the partial answer is still valid." },
      { title: "Undo", detail: "Remove the choice so sibling branches start clean." }
    ],
    complexity: { time: "Exponential in branch depth", space: "O(depth)" },
    answerPseudocode: ["def dfs(state): if complete, record answer", "for choice in choices: choose, dfs, undo", "prune invalid branches early"]
  },
  Graphs: {
    pattern: "Graph traversal",
    state: [
      { name: "visited", purpose: "Prevents revisiting nodes or cells." },
      { name: "frontier", purpose: "Stack, queue, or recursion boundary." },
      { name: "component/result", purpose: "Aggregates the traversal outcome." }
    ],
    flow: [
      { title: "Build or read neighbors", detail: "Know how each node reaches adjacent nodes." },
      { title: "Traverse frontier", detail: "Use BFS/DFS to visit reachable nodes." },
      { title: "Aggregate", detail: "Count components, mark reachability, or detect cycles." }
    ],
    complexity: { time: "O(V + E) or O(rows * cols)", space: "O(V) visited/frontier" },
    answerPseudocode: ["for each start node/cell: if unseen, traverse", "mark every reachable neighbor", "update count or validity from traversal"]
  },
  "Advanced Graphs": {
    pattern: "Topological ordering",
    state: [
      { name: "edges", purpose: "Ordering constraints between symbols or nodes." },
      { name: "indegree / visiting", purpose: "Detects whether a node is ready or cyclic." },
      { name: "order", purpose: "The final valid topological order." }
    ],
    flow: [
      { title: "Derive constraints", detail: "Compare adjacent words or prerequisites to create directed edges." },
      { title: "Detect cycles", detail: "Use indegrees or DFS states to reject impossible orderings." },
      { title: "Emit order", detail: "Append nodes only after their dependencies are satisfied." }
    ],
    complexity: { time: "O(total input size + edges)", space: "O(nodes + edges)" },
    answerPseudocode: ["build directed constraints", "topologically process nodes", "return order only if every node is placed"]
  },
  "1-D Dynamic Programming": {
    pattern: "Linear recurrence",
    state: [
      { name: "dp[i]", purpose: "Best answer for the prefix or position ending at i." },
      { name: "previous states", purpose: "Earlier answers used to compute the current one." },
      { name: "best", purpose: "Optional global best across all positions." }
    ],
    flow: [
      { title: "Define dp meaning", detail: "Make dp[i] a sentence before writing transitions." },
      { title: "Seed bases", detail: "Fill the first one or two answers directly." },
      { title: "Transition forward", detail: "Compute each state from smaller states." }
    ],
    complexity: { time: "Usually O(n) or O(n * choices)", space: "O(n), often reducible" },
    answerPseudocode: ["define base cases", "for i in range(...): dp[i] = recurrence", "return final or best dp value"]
  },
  "2-D Dynamic Programming": {
    pattern: "Grid/table recurrence",
    state: [
      { name: "dp[row][col]", purpose: "Best answer for two prefixes or a grid position." },
      { name: "top / left / diagonal", purpose: "Neighboring states that feed the transition." },
      { name: "base row/column", purpose: "Empty-prefix or boundary answers." }
    ],
    flow: [
      { title: "Define cell meaning", detail: "Each cell should answer a smaller version of the problem." },
      { title: "Initialize boundaries", detail: "Fill zero row/column or first grid edge." },
      { title: "Fill table", detail: "Use neighboring cells to compute the current answer." }
    ],
    complexity: { time: "O(rows * cols)", space: "O(rows * cols), sometimes compressible" },
    answerPseudocode: ["create dp table", "initialize boundaries", "for each cell: combine neighbors", "return target cell"]
  },
  Greedy: {
    pattern: "Local choice with invariant",
    state: [
      { name: "current", purpose: "The running score, reach, or interval state." },
      { name: "best", purpose: "The best answer preserved so far." },
      { name: "invariant", purpose: "Why the local choice remains safe." }
    ],
    flow: [
      { title: "Track only what matters", detail: "Keep the smallest state that summarizes the past." },
      { title: "Make local update", detail: "Choose the local action that preserves the invariant." },
      { title: "Commit best", detail: "Update the answer without revisiting previous choices." }
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    answerPseudocode: ["initialize current and best", "for each item: update current by invariant", "return best/reachability"]
  },
  Intervals: {
    pattern: "Sorted interval sweep",
    state: [
      { name: "current interval", purpose: "The interval being merged or compared." },
      { name: "end", purpose: "The active boundary that decides overlap." },
      { name: "result/removals", purpose: "Merged intervals or count of discarded overlaps." }
    ],
    flow: [
      { title: "Sort by start", detail: "Make overlap decisions local and monotonic." },
      { title: "Compare boundaries", detail: "Overlap exists when the next start is before the active end." },
      { title: "Merge or count", detail: "Extend the active interval or record a removal/room." }
    ],
    complexity: { time: "O(n log n)", space: "O(n) for output or heap" },
    answerPseudocode: ["sort intervals", "scan and compare next.start with active end", "merge, count, or allocate resources"]
  },
  "Math & Geometry": {
    pattern: "Boundary simulation",
    state: [
      { name: "bounds", purpose: "Top/bottom/left/right or layer boundaries." },
      { name: "position", purpose: "The current cell being transformed or read." },
      { name: "result", purpose: "The transformed matrix or traversal order." }
    ],
    flow: [
      { title: "Choose representation", detail: "Decide whether to mutate layers or build a returned matrix/list." },
      { title: "Move by boundary", detail: "Traverse or rotate one layer/direction at a time." },
      { title: "Tighten bounds", detail: "After finishing a layer, move inward." }
    ],
    complexity: { time: "O(rows * cols)", space: "O(1) in-place or O(output)" },
    answerPseudocode: ["set boundaries/layers", "process one direction or ring", "shrink boundaries and repeat"]
  },
  "Bit Manipulation": {
    pattern: "Bitwise state transitions",
    state: [
      { name: "bits", purpose: "The current binary representation being inspected." },
      { name: "mask/carry", purpose: "Isolates or moves bit information." },
      { name: "answer", purpose: "The accumulated integer or count." }
    ],
    flow: [
      { title: "Inspect low bits", detail: "Use shifts, masks, or xor to read/update one bit at a time." },
      { title: "Apply identity", detail: "Use properties like n & (n - 1), xor cancellation, or carry propagation." },
      { title: "Accumulate", detail: "Build the count, reversed value, or missing number." }
    ],
    complexity: { time: "O(1) for fixed 32-bit integers or O(n)", space: "O(1) besides output" },
    answerPseudocode: ["initialize answer", "while bits/items remain: apply bit identity", "return accumulated value"]
  }
};

function starterCode(functionName: string, args: string, prompt: string) {
  return `def ${functionName}(${args}):
    # ${prompt}
    pass`;
}

function makeVisualization(seed: ProblemSeed, sampleTests: PracticeTestCase[]): AlgorithmVisualization {
  const base = categoryVisuals[seed.category] ?? categoryVisuals["Arrays & Hashing"];
  const sample = sampleTests[0];

  return {
    pattern: base.pattern,
    summary: `${seed.title} is best understood as a ${base.pattern.toLowerCase()} problem: ${seed.prompt}`,
    state: base.state,
    flow: [
      {
        title: "Read the contract",
        detail: `Inputs enter as (${seed.args}). The function must produce ${JSON.stringify(seed.expected)} for the sample shape.`
      },
      ...base.flow,
      {
        title: "Return the contract value",
        detail: `Return exactly what ${seed.functionName} promises, not just an intermediate helper state.`
      }
    ],
    dryRun: [
      { label: "sample input", value: sample.input.args },
      { label: "target output", value: sample.expected },
      { label: "key invariant", value: seed.hints?.[0] ?? base.flow[0].detail }
    ],
    complexity: base.complexity,
    answerPseudocode: [
      `def ${seed.functionName}(${seed.args}):`,
      ...base.answerPseudocode.map((line) => `  ${line}`),
      "  return answer"
    ]
  };
}

function makeProblem(seed: ProblemSeed): Blind75Problem {
  const sampleTests: PracticeTestCase[] = [
    {
      id: `${seed.id}-sample-1`,
      name: "sample case",
      input: { args: seed.sampleArgs },
      expected: seed.expected
    }
  ];

  return {
    id: seed.id,
    title: seed.title,
    difficulty: seed.difficulty,
    category: seed.category,
    leetcodeSlug: seed.leetcodeSlug,
    practice: {
      functionName: seed.functionName,
      starterCode: starterCode(seed.functionName, seed.args, seed.prompt),
      prompt: seed.prompt,
      constraints: seed.constraints ?? [
        "Inputs are JSON-serializable for the local CodeAssist runner.",
        "For linked-list and tree questions, use the provided array representation in sample tests."
      ],
      hints: seed.hints ?? defaultHints,
      sampleTests
    },
    visualization: makeVisualization(seed, sampleTests)
  };
}

export const blind75Problems: Blind75Problem[] = [
  makeProblem({
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    leetcodeSlug: "contains-duplicate",
    functionName: "contains_duplicate",
    args: "nums",
    prompt: "Return True if any value appears at least twice.",
    sampleArgs: [[1, 2, 3, 1]],
    expected: true,
    hints: ["A set can remember what has already appeared.", "Return as soon as you see a repeated value.", "If the scan finishes, no duplicate exists."]
  }),
  makeProblem({
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    leetcodeSlug: "valid-anagram",
    functionName: "is_anagram",
    args: "s, t",
    prompt: "Return True if t is an anagram of s.",
    sampleArgs: ["anagram", "nagaram"],
    expected: true,
    hints: ["Compare character frequencies.", "Different lengths cannot be anagrams.", "A dictionary or sorted strings can work."]
  }),
  makeProblem({
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    leetcodeSlug: "two-sum",
    functionName: "two_sum",
    args: "nums, target",
    prompt: "Return indices of the two numbers that add up to target.",
    sampleArgs: [[2, 7, 11, 15], 9],
    expected: [0, 1],
    hints: ["Compute the complement for each value.", "Check memory before storing the current value.", "A hash map gives constant-time lookup."]
  }),
  makeProblem({
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    leetcodeSlug: "group-anagrams",
    functionName: "group_anagrams",
    args: "strs",
    prompt: "Group words that are anagrams of each other.",
    sampleArgs: [["eat", "tea", "tan", "ate", "nat", "bat"]],
    expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
    hints: ["Use a canonical key for each word.", "Sorted letters or a 26-count tuple can be the key.", "Collect matching keys in a dictionary."]
  }),
  makeProblem({
    id: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    leetcodeSlug: "top-k-frequent-elements",
    functionName: "top_k_frequent",
    args: "nums, k",
    prompt: "Return the k most frequent values.",
    sampleArgs: [[1, 1, 1, 2, 2, 3], 2],
    expected: [1, 2],
    hints: ["Count frequencies first.", "A heap or bucket array can select the top k.", "Bucket sort can reach linear time."]
  }),
  makeProblem({
    id: "product-of-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    leetcodeSlug: "product-of-array-except-self",
    functionName: "product_except_self",
    args: "nums",
    prompt: "Return products of all elements except self without division.",
    sampleArgs: [[1, 2, 3, 4]],
    expected: [24, 12, 8, 6],
    hints: ["Use prefix products from the left.", "Use suffix products from the right.", "Multiply the two passes for each index."]
  }),
  makeProblem({
    id: "encode-and-decode-strings",
    title: "Encode and Decode Strings",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    leetcodeSlug: "encode-and-decode-strings",
    functionName: "encode_decode",
    args: "strs",
    prompt: "Encode a list of strings and decode it back to the same list.",
    sampleArgs: [["lint", "code", "love", "you"]],
    expected: ["lint", "code", "love", "you"],
    hints: ["Use a length prefix so separators inside strings are safe.", "Decode by reading length, delimiter, then payload.", "Return the decoded list for the sample tests."]
  }),
  makeProblem({
    id: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    leetcodeSlug: "longest-consecutive-sequence",
    functionName: "longest_consecutive",
    args: "nums",
    prompt: "Return the length of the longest consecutive integer streak.",
    sampleArgs: [[100, 4, 200, 1, 3, 2]],
    expected: 4,
    hints: ["Put values in a set.", "Only start counting at numbers that have no predecessor.", "Expand forward until the streak ends."]
  }),

  makeProblem({ id: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", category: "Two Pointers", leetcodeSlug: "valid-palindrome", functionName: "is_palindrome", args: "s", prompt: "Return True if the cleaned string is a palindrome.", sampleArgs: ["A man, a plan, a canal: Panama"], expected: true, hints: ["Skip non-alphanumeric characters.", "Compare lowercase characters from both ends.", "Move inward after every successful comparison."] }),
  makeProblem({ id: "3sum", title: "3Sum", difficulty: "Medium", category: "Two Pointers", leetcodeSlug: "3sum", functionName: "three_sum", args: "nums", prompt: "Return unique triplets that sum to zero.", sampleArgs: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]], hints: ["Sort the array first.", "Fix one number, then use two pointers.", "Skip duplicates for both fixed and moving pointers."] }),
  makeProblem({ id: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", category: "Two Pointers", leetcodeSlug: "container-with-most-water", functionName: "max_area", args: "height", prompt: "Return the maximum water area between two lines.", sampleArgs: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49, hints: ["Start with both ends.", "Area is width times the shorter height.", "Move the pointer at the shorter line."] }),

  makeProblem({ id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Sliding Window", leetcodeSlug: "best-time-to-buy-and-sell-stock", functionName: "max_profit", args: "prices", prompt: "Return the best profit from one buy and one sell.", sampleArgs: [[7, 1, 5, 3, 6, 4]], expected: 5, hints: ["Track the lowest price so far.", "At each day, compute selling today.", "Keep the best profit seen."] }),
  makeProblem({ id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Sliding Window", leetcodeSlug: "longest-substring-without-repeating-characters", functionName: "length_of_longest_substring", args: "s", prompt: "Return the length of the longest substring without duplicate characters.", sampleArgs: ["abcabcbb"], expected: 3, hints: ["Use a sliding window.", "Move the left edge past duplicates.", "Track characters currently in the window."] }),
  makeProblem({ id: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", difficulty: "Medium", category: "Sliding Window", leetcodeSlug: "longest-repeating-character-replacement", functionName: "character_replacement", args: "s, k", prompt: "Return the longest substring length after at most k replacements.", sampleArgs: ["ABAB", 2], expected: 4, hints: ["Track counts inside the window.", "The window is valid when length minus max frequency is <= k.", "Shrink only when invalid."] }),
  makeProblem({ id: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", category: "Sliding Window", leetcodeSlug: "minimum-window-substring", functionName: "min_window", args: "s, t", prompt: "Return the smallest substring of s containing all characters of t.", sampleArgs: ["ADOBECODEBANC", "ABC"], expected: "BANC", hints: ["Track required character counts.", "Expand until all needs are satisfied.", "Then shrink while the window remains valid."] }),

  makeProblem({ id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", category: "Stack", leetcodeSlug: "valid-parentheses", functionName: "is_valid", args: "s", prompt: "Return True if brackets close in the correct order.", sampleArgs: ["()[]{}"], expected: true, hints: ["Push opening brackets.", "Closing brackets must match the top.", "The stack must be empty at the end."] }),

  makeProblem({ id: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", leetcodeSlug: "find-minimum-in-rotated-sorted-array", functionName: "find_min", args: "nums", prompt: "Return the minimum value in a rotated sorted array.", sampleArgs: [[3, 4, 5, 1, 2]], expected: 1, hints: ["Compare mid with the right edge.", "If mid is greater, the minimum is right.", "Otherwise it is at mid or left."] }),
  makeProblem({ id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", leetcodeSlug: "search-in-rotated-sorted-array", functionName: "search", args: "nums, target", prompt: "Return the index of target in a rotated sorted array.", sampleArgs: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, hints: ["One side of every split is sorted.", "Decide whether target lies in the sorted half.", "Move the search bounds accordingly."] }),

  makeProblem({ id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", category: "Linked List", leetcodeSlug: "reverse-linked-list", functionName: "reverse_list", args: "values", prompt: "Return the reversed linked-list values. CodeAssist represents the list as an array.", sampleArgs: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] }),
  makeProblem({ id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked List", leetcodeSlug: "merge-two-sorted-lists", functionName: "merge_two_lists", args: "list1, list2", prompt: "Merge two sorted linked-list value arrays.", sampleArgs: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] }),
  makeProblem({ id: "reorder-list", title: "Reorder List", difficulty: "Medium", category: "Linked List", leetcodeSlug: "reorder-list", functionName: "reorder_list", args: "values", prompt: "Return values reordered as first, last, second, second-last, and so on.", sampleArgs: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] }),
  makeProblem({ id: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", difficulty: "Medium", category: "Linked List", leetcodeSlug: "remove-nth-node-from-end-of-list", functionName: "remove_nth_from_end", args: "values, n", prompt: "Remove the nth value from the end of the linked-list value array.", sampleArgs: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] }),
  makeProblem({ id: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Easy", category: "Linked List", leetcodeSlug: "linked-list-cycle", functionName: "has_cycle", args: "values, pos", prompt: "Return True when pos indicates a cycle entry in the linked-list sample.", sampleArgs: [[3, 2, 0, -4], 1], expected: true }),
  makeProblem({ id: "merge-k-sorted-lists", title: "Merge K Sorted Lists", difficulty: "Hard", category: "Linked List", leetcodeSlug: "merge-k-sorted-lists", functionName: "merge_k_lists", args: "lists", prompt: "Merge k sorted linked-list value arrays into one sorted array.", sampleArgs: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] }),

  makeProblem({ id: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", category: "Trees", leetcodeSlug: "invert-binary-tree", functionName: "invert_tree", args: "root", prompt: "Invert a binary tree represented as level-order values.", sampleArgs: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] }),
  makeProblem({ id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", category: "Trees", leetcodeSlug: "maximum-depth-of-binary-tree", functionName: "max_depth", args: "root", prompt: "Return the max depth of a binary tree represented as level-order values.", sampleArgs: [[3, 9, 20, null, null, 15, 7]], expected: 3 }),
  makeProblem({ id: "same-tree", title: "Same Tree", difficulty: "Easy", category: "Trees", leetcodeSlug: "same-tree", functionName: "is_same_tree", args: "p, q", prompt: "Return True if two level-order tree arrays represent the same tree.", sampleArgs: [[1, 2, 3], [1, 2, 3]], expected: true }),
  makeProblem({ id: "subtree-of-another-tree", title: "Subtree of Another Tree", difficulty: "Easy", category: "Trees", leetcodeSlug: "subtree-of-another-tree", functionName: "is_subtree", args: "root, sub_root", prompt: "Return True if sub_root is contained inside root.", sampleArgs: [[3, 4, 5, 1, 2], [4, 1, 2]], expected: true }),
  makeProblem({ id: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a BST", difficulty: "Medium", category: "Trees", leetcodeSlug: "lowest-common-ancestor-of-a-binary-search-tree", functionName: "lowest_common_ancestor", args: "root, p, q", prompt: "Return the value of the lowest common ancestor in a BST.", sampleArgs: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 }),
  makeProblem({ id: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", category: "Trees", leetcodeSlug: "validate-binary-search-tree", functionName: "is_valid_bst", args: "root", prompt: "Return True if the level-order tree array is a valid BST.", sampleArgs: [[2, 1, 3]], expected: true }),
  makeProblem({ id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", category: "Trees", leetcodeSlug: "construct-binary-tree-from-preorder-and-inorder-traversal", functionName: "build_tree", args: "preorder, inorder", prompt: "Build the tree and return its level-order values.", sampleArgs: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expected: [3, 9, 20, null, null, 15, 7] }),
  makeProblem({ id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", category: "Trees", leetcodeSlug: "binary-tree-level-order-traversal", functionName: "level_order", args: "root", prompt: "Return the tree values by level.", sampleArgs: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] }),
  makeProblem({ id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", category: "Trees", leetcodeSlug: "kth-smallest-element-in-a-bst", functionName: "kth_smallest", args: "root, k", prompt: "Return the kth smallest value in a BST.", sampleArgs: [[3, 1, 4, null, 2], 1], expected: 1 }),
  makeProblem({ id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", category: "Trees", leetcodeSlug: "binary-tree-maximum-path-sum", functionName: "max_path_sum", args: "root", prompt: "Return the maximum path sum in the tree.", sampleArgs: [[1, 2, 3]], expected: 6 }),
  makeProblem({ id: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", category: "Trees", leetcodeSlug: "serialize-and-deserialize-binary-tree", functionName: "serialize_deserialize", args: "root", prompt: "Serialize and deserialize the tree, returning the recovered level-order values.", sampleArgs: [[1, 2, 3, null, null, 4, 5]], expected: [1, 2, 3, null, null, 4, 5] }),

  makeProblem({ id: "implement-trie-prefix-tree", title: "Implement Trie Prefix Tree", difficulty: "Medium", category: "Tries", leetcodeSlug: "implement-trie-prefix-tree", functionName: "trie_session", args: "operations, values", prompt: "Simulate Trie operations and return outputs for search/startsWith calls.", sampleArgs: [["insert", "search", "search", "startsWith", "insert", "search"], ["apple", "apple", "app", "app", "app", "app"]], expected: [null, true, false, true, null, true] }),
  makeProblem({ id: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", difficulty: "Medium", category: "Tries", leetcodeSlug: "design-add-and-search-words-data-structure", functionName: "word_dictionary_session", args: "operations, values", prompt: "Simulate WordDictionary operations with dot wildcards.", sampleArgs: [["addWord", "addWord", "addWord", "search", "search", "search", "search"], ["bad", "dad", "mad", "pad", "bad", ".ad", "b.."]], expected: [null, null, null, false, true, true, true] }),
  makeProblem({ id: "word-search-ii", title: "Word Search II", difficulty: "Hard", category: "Tries", leetcodeSlug: "word-search-ii", functionName: "find_words", args: "board, words", prompt: "Return all words found in the board.", sampleArgs: [[["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]], ["oath", "pea", "eat", "rain"]], expected: ["oath", "eat"] }),

  makeProblem({ id: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", category: "Heap / Priority Queue", leetcodeSlug: "find-median-from-data-stream", functionName: "median_finder_session", args: "operations, values", prompt: "Simulate MedianFinder operations and return median outputs.", sampleArgs: [["addNum", "addNum", "findMedian", "addNum", "findMedian"], [1, 2, null, 3, null]], expected: [null, null, 1.5, null, 2] }),

  makeProblem({ id: "combination-sum", title: "Combination Sum", difficulty: "Medium", category: "Backtracking", leetcodeSlug: "combination-sum", functionName: "combination_sum", args: "candidates, target", prompt: "Return combinations that sum to target. Values may be reused.", sampleArgs: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]], hints: ["Use DFS with a start index.", "Choose the same candidate again when reuse is allowed.", "Stop when remaining target is below zero."] }),
  makeProblem({ id: "word-search", title: "Word Search", difficulty: "Medium", category: "Backtracking", leetcodeSlug: "word-search", functionName: "exist", args: "board, word", prompt: "Return True if word exists in the grid by adjacent moves.", sampleArgs: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCCED"], expected: true }),

  makeProblem({ id: "number-of-islands", title: "Number of Islands", difficulty: "Medium", category: "Graphs", leetcodeSlug: "number-of-islands", functionName: "num_islands", args: "grid", prompt: "Count connected groups of land cells.", sampleArgs: [[["1", "1", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0"]]], expected: 1 }),
  makeProblem({ id: "clone-graph", title: "Clone Graph", difficulty: "Medium", category: "Graphs", leetcodeSlug: "clone-graph", functionName: "clone_graph", args: "adj_list", prompt: "Clone an undirected graph represented as an adjacency list and return the cloned adjacency list.", sampleArgs: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expected: [[2, 4], [1, 3], [2, 4], [1, 3]] }),
  makeProblem({ id: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", difficulty: "Medium", category: "Graphs", leetcodeSlug: "pacific-atlantic-water-flow", functionName: "pacific_atlantic", args: "heights", prompt: "Return cells that can flow to both oceans.", sampleArgs: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]] }),
  makeProblem({ id: "course-schedule", title: "Course Schedule", difficulty: "Medium", category: "Graphs", leetcodeSlug: "course-schedule", functionName: "can_finish", args: "num_courses, prerequisites", prompt: "Return True if all courses can be completed.", sampleArgs: [2, [[1, 0]]], expected: true }),
  makeProblem({ id: "graph-valid-tree", title: "Graph Valid Tree", difficulty: "Medium", category: "Graphs", leetcodeSlug: "graph-valid-tree", functionName: "valid_tree", args: "n, edges", prompt: "Return True if the undirected graph is connected and acyclic.", sampleArgs: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], expected: true }),
  makeProblem({ id: "number-of-connected-components-in-an-undirected-graph", title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", category: "Graphs", leetcodeSlug: "number-of-connected-components-in-an-undirected-graph", functionName: "count_components", args: "n, edges", prompt: "Return the number of connected components.", sampleArgs: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 }),

  makeProblem({ id: "alien-dictionary", title: "Alien Dictionary", difficulty: "Hard", category: "Advanced Graphs", leetcodeSlug: "alien-dictionary", functionName: "alien_order", args: "words", prompt: "Return one valid character ordering for the alien language.", sampleArgs: [["wrt", "wrf", "er", "ett", "rftt"]], expected: "wertf" }),

  makeProblem({ id: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", category: "1-D Dynamic Programming", leetcodeSlug: "climbing-stairs", functionName: "climb_stairs", args: "n", prompt: "Return the number of ways to climb n stairs.", sampleArgs: [3], expected: 3 }),
  makeProblem({ id: "house-robber", title: "House Robber", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "house-robber", functionName: "rob", args: "nums", prompt: "Return the max money without robbing adjacent houses.", sampleArgs: [[1, 2, 3, 1]], expected: 4 }),
  makeProblem({ id: "house-robber-ii", title: "House Robber II", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "house-robber-ii", functionName: "rob_circle", args: "nums", prompt: "Return the max money when houses form a circle.", sampleArgs: [[2, 3, 2]], expected: 3 }),
  makeProblem({ id: "longest-palindromic-substring", title: "Longest Palindromic Substring", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "longest-palindromic-substring", functionName: "longest_palindrome", args: "s", prompt: "Return the longest palindromic substring.", sampleArgs: ["babad"], expected: "bab" }),
  makeProblem({ id: "palindromic-substrings", title: "Palindromic Substrings", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "palindromic-substrings", functionName: "count_substrings", args: "s", prompt: "Count palindromic substrings.", sampleArgs: ["aaa"], expected: 6 }),
  makeProblem({ id: "decode-ways", title: "Decode Ways", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "decode-ways", functionName: "num_decodings", args: "s", prompt: "Return the number of ways to decode a digit string.", sampleArgs: ["226"], expected: 3 }),
  makeProblem({ id: "coin-change", title: "Coin Change", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "coin-change", functionName: "coin_change", args: "coins, amount", prompt: "Return the fewest coins needed to make amount.", sampleArgs: [[1, 2, 5], 11], expected: 3 }),
  makeProblem({ id: "maximum-product-subarray", title: "Maximum Product Subarray", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "maximum-product-subarray", functionName: "max_product", args: "nums", prompt: "Return the maximum product of a contiguous subarray.", sampleArgs: [[2, 3, -2, 4]], expected: 6 }),
  makeProblem({ id: "word-break", title: "Word Break", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "word-break", functionName: "word_break", args: "s, word_dict", prompt: "Return True if s can be segmented into dictionary words.", sampleArgs: ["leetcode", ["leet", "code"]], expected: true }),
  makeProblem({ id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", category: "1-D Dynamic Programming", leetcodeSlug: "longest-increasing-subsequence", functionName: "length_of_lis", args: "nums", prompt: "Return the length of the longest strictly increasing subsequence.", sampleArgs: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 }),

  makeProblem({ id: "unique-paths", title: "Unique Paths", difficulty: "Medium", category: "2-D Dynamic Programming", leetcodeSlug: "unique-paths", functionName: "unique_paths", args: "m, n", prompt: "Return the number of paths from top-left to bottom-right.", sampleArgs: [3, 7], expected: 28 }),
  makeProblem({ id: "longest-common-subsequence", title: "Longest Common Subsequence", difficulty: "Medium", category: "2-D Dynamic Programming", leetcodeSlug: "longest-common-subsequence", functionName: "longest_common_subsequence", args: "text1, text2", prompt: "Return the length of the longest common subsequence.", sampleArgs: ["abcde", "ace"], expected: 3 }),

  makeProblem({ id: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", category: "Greedy", leetcodeSlug: "maximum-subarray", functionName: "max_sub_array", args: "nums", prompt: "Return the maximum sum of a contiguous subarray.", sampleArgs: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 }),
  makeProblem({ id: "jump-game", title: "Jump Game", difficulty: "Medium", category: "Greedy", leetcodeSlug: "jump-game", functionName: "can_jump", args: "nums", prompt: "Return True if you can reach the last index.", sampleArgs: [[2, 3, 1, 1, 4]], expected: true }),

  makeProblem({ id: "insert-interval", title: "Insert Interval", difficulty: "Medium", category: "Intervals", leetcodeSlug: "insert-interval", functionName: "insert", args: "intervals, new_interval", prompt: "Insert and merge a new interval.", sampleArgs: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] }),
  makeProblem({ id: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", category: "Intervals", leetcodeSlug: "merge-intervals", functionName: "merge", args: "intervals", prompt: "Merge all overlapping intervals.", sampleArgs: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] }),
  makeProblem({ id: "non-overlapping-intervals", title: "Non-overlapping Intervals", difficulty: "Medium", category: "Intervals", leetcodeSlug: "non-overlapping-intervals", functionName: "erase_overlap_intervals", args: "intervals", prompt: "Return the minimum number of intervals to remove to eliminate overlaps.", sampleArgs: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 }),
  makeProblem({ id: "meeting-rooms", title: "Meeting Rooms", difficulty: "Easy", category: "Intervals", leetcodeSlug: "meeting-rooms", functionName: "can_attend_meetings", args: "intervals", prompt: "Return True if a person can attend all meetings.", sampleArgs: [[[0, 30], [5, 10], [15, 20]]], expected: false }),
  makeProblem({ id: "meeting-rooms-ii", title: "Meeting Rooms II", difficulty: "Medium", category: "Intervals", leetcodeSlug: "meeting-rooms-ii", functionName: "min_meeting_rooms", args: "intervals", prompt: "Return the minimum number of meeting rooms needed.", sampleArgs: [[[0, 30], [5, 10], [15, 20]]], expected: 2 }),

  makeProblem({ id: "rotate-image", title: "Rotate Image", difficulty: "Medium", category: "Math & Geometry", leetcodeSlug: "rotate-image", functionName: "rotate", args: "matrix", prompt: "Return the matrix rotated 90 degrees clockwise.", sampleArgs: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] }),
  makeProblem({ id: "spiral-matrix", title: "Spiral Matrix", difficulty: "Medium", category: "Math & Geometry", leetcodeSlug: "spiral-matrix", functionName: "spiral_order", args: "matrix", prompt: "Return the matrix values in spiral order.", sampleArgs: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] }),
  makeProblem({ id: "set-matrix-zeroes", title: "Set Matrix Zeroes", difficulty: "Medium", category: "Math & Geometry", leetcodeSlug: "set-matrix-zeroes", functionName: "set_zeroes", args: "matrix", prompt: "Return the matrix after zeroing rows and columns that contain a zero.", sampleArgs: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] }),

  makeProblem({ id: "number-of-1-bits", title: "Number of 1 Bits", difficulty: "Easy", category: "Bit Manipulation", leetcodeSlug: "number-of-1-bits", functionName: "hamming_weight", args: "n", prompt: "Return the number of set bits in n.", sampleArgs: [11], expected: 3 }),
  makeProblem({ id: "counting-bits", title: "Counting Bits", difficulty: "Easy", category: "Bit Manipulation", leetcodeSlug: "counting-bits", functionName: "count_bits", args: "n", prompt: "Return bit counts for every number from 0 through n.", sampleArgs: [5], expected: [0, 1, 1, 2, 1, 2] }),
  makeProblem({ id: "reverse-bits", title: "Reverse Bits", difficulty: "Easy", category: "Bit Manipulation", leetcodeSlug: "reverse-bits", functionName: "reverse_bits", args: "n", prompt: "Reverse the bits of a 32-bit unsigned integer.", sampleArgs: [43261596], expected: 964176192 }),
  makeProblem({ id: "missing-number", title: "Missing Number", difficulty: "Easy", category: "Bit Manipulation", leetcodeSlug: "missing-number", functionName: "missing_number", args: "nums", prompt: "Return the missing number from range 0..n.", sampleArgs: [[3, 0, 1]], expected: 2 }),
  makeProblem({ id: "sum-of-two-integers", title: "Sum of Two Integers", difficulty: "Medium", category: "Bit Manipulation", leetcodeSlug: "sum-of-two-integers", functionName: "get_sum", args: "a, b", prompt: "Return the sum without using + or -.", sampleArgs: [1, 2], expected: 3 })
];

export const blind75Categories = Array.from(new Set(blind75Problems.map((problem) => problem.category)));

export function getBlind75Problem(problemId: string) {
  return blind75Problems.find((problem) => problem.id === problemId);
}
