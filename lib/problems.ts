import type { AlgorithmicProblem } from "@/lib/types";

const twoSumCode = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return []`;

const binarySearchCode = `def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`;

const lcsCode = `def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`;

const fibonacciCode = `def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`;

const courseScheduleCode = `def can_finish(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    indegree = [0] * num_courses
    for course, pre in prerequisites:
        graph[pre].append(course)
        indegree[course] += 1
    queue = [i for i in range(num_courses) if indegree[i] == 0]
    visited = 0
    while queue:
        node = queue.pop(0)
        visited += 1
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return visited == num_courses`;

export const problems: AlgorithmicProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    language: "python",
    codeSnippet: twoSumCode,
    fullTrace: [
      {
        stepIndex: 0,
        lineNumber: 1,
        explanation: "The function receives nums = [2, 7, 11, 15] and target = 9.",
        variables: { nums: [2, 7, 11, 15], target: 9 },
        stdout: [],
        pointerChanges: { nums: "read", target: "read" }
      },
      {
        stepIndex: 1,
        lineNumber: 2,
        explanation: "Create a hash map that will remember each value's index.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: {} },
        stdout: [],
        pointerChanges: { seen: "write" }
      },
      {
        stepIndex: 2,
        lineNumber: 3,
        explanation: "Start the scan at index 0 with value 2.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, num: 2 },
        stdout: [],
        pointerChanges: { i: "active", num: "read" }
      },
      {
        stepIndex: 3,
        lineNumber: 4,
        explanation: "Compute the complement needed to reach target: 9 - 2 = 7.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, num: 2, need: 7 },
        stdout: [],
        pointerChanges: { need: "write", target: "read", num: "read" }
      },
      {
        stepIndex: 4,
        lineNumber: 5,
        explanation: "7 is not in seen yet, so the pair is not complete.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, num: 2, need: 7 },
        stdout: [],
        pointerChanges: { need: "read", seen: "read" }
      },
      {
        stepIndex: 5,
        lineNumber: 7,
        explanation: "Store value 2 at index 0 for future complement checks.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: { "2": 0 }, i: 0, num: 2, need: 7 },
        stdout: [],
        pointerChanges: { seen: "write", num: "read", i: "read" }
      },
      {
        stepIndex: 6,
        lineNumber: 3,
        explanation: "Advance to index 1 with value 7.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: { "2": 0 }, i: 1, num: 7, need: 7 },
        stdout: [],
        pointerChanges: { i: "active", num: "read" }
      },
      {
        stepIndex: 7,
        lineNumber: 4,
        explanation: "Compute the complement: 9 - 7 = 2.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: { "2": 0 }, i: 1, num: 7, need: 2 },
        stdout: [],
        pointerChanges: { need: "write", target: "read", num: "read" }
      },
      {
        stepIndex: 8,
        lineNumber: 5,
        explanation: "2 exists in seen, so the algorithm found the matching earlier index.",
        variables: { nums: [2, 7, 11, 15], target: 9, seen: { "2": 0 }, i: 1, num: 7, need: 2 },
        stdout: [],
        pointerChanges: { need: "read", seen: "read" }
      },
      {
        stepIndex: 9,
        lineNumber: 6,
        explanation: "Return the saved index for 2 and the current index for 7.",
        variables: {
          nums: [2, 7, 11, 15],
          target: 9,
          seen: { "2": 0 },
          i: 1,
          num: 7,
          need: 2,
          result: [0, 1]
        },
        stdout: ["[0, 1]"],
        pointerChanges: { result: "write" }
      }
    ],
    drillCheckpoints: [
      { stepIndex: 3, promptType: "variable", target: "need", choices: ["7", "2", "9", "undefined"] },
      { stepIndex: 7, promptType: "line", target: "lineNumber", choices: ["5", "6", "7", "8"] }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Arrays",
    language: "python",
    codeSnippet: binarySearchCode,
    fullTrace: [
      {
        stepIndex: 0,
        lineNumber: 1,
        explanation: "Search for target 9 in the sorted array.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9 },
        stdout: [],
        pointerChanges: { nums: "read", target: "read" }
      },
      {
        stepIndex: 1,
        lineNumber: 2,
        explanation: "Initialize the search window to cover the entire array.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 0, high: 5 },
        stdout: [],
        pointerChanges: { low: "write", high: "write" }
      },
      {
        stepIndex: 2,
        lineNumber: 3,
        explanation: "The search window is valid because low <= high.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 0, high: 5 },
        stdout: [],
        pointerChanges: { low: "read", high: "read" }
      },
      {
        stepIndex: 3,
        lineNumber: 4,
        explanation: "Choose the middle index 2, where nums[2] is 5.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 0, high: 5, mid: 2 },
        stdout: [],
        pointerChanges: { mid: "write" }
      },
      {
        stepIndex: 4,
        lineNumber: 5,
        explanation: "nums[mid] is 5, not the target 9.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 0, high: 5, mid: 2 },
        stdout: [],
        pointerChanges: { mid: "read", target: "read" }
      },
      {
        stepIndex: 5,
        lineNumber: 7,
        explanation: "Because 5 is less than 9, the answer must be to the right.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 0, high: 5, mid: 2 },
        stdout: [],
        pointerChanges: { mid: "read", target: "read" }
      },
      {
        stepIndex: 6,
        lineNumber: 8,
        explanation: "Move low to mid + 1, shrinking away the left half.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 3, high: 5, mid: 2 },
        stdout: [],
        pointerChanges: { low: "write" }
      },
      {
        stepIndex: 7,
        lineNumber: 3,
        explanation: "The new search window from 3 to 5 is still valid.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 3, high: 5, mid: 2 },
        stdout: [],
        pointerChanges: { low: "read", high: "read" }
      },
      {
        stepIndex: 8,
        lineNumber: 4,
        explanation: "Pick middle index 4, where nums[4] is 9.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 3, high: 5, mid: 4 },
        stdout: [],
        pointerChanges: { mid: "write" }
      },
      {
        stepIndex: 9,
        lineNumber: 5,
        explanation: "The middle value equals the target.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 3, high: 5, mid: 4 },
        stdout: [],
        pointerChanges: { mid: "read", target: "read" }
      },
      {
        stepIndex: 10,
        lineNumber: 6,
        explanation: "Return the matching index.",
        variables: { nums: [1, 3, 5, 7, 9, 11], target: 9, low: 3, high: 5, mid: 4, result: 4 },
        stdout: ["4"],
        pointerChanges: { result: "write" }
      }
    ],
    drillCheckpoints: [
      { stepIndex: 3, promptType: "variable", target: "mid", choices: ["2", "3", "4", "5"] },
      { stepIndex: 5, promptType: "line", target: "lineNumber", choices: ["8", "9", "10", "11"] }
    ]
  },
  {
    id: "lcs",
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    category: "Dynamic Programming",
    language: "python",
    codeSnippet: lcsCode,
    fullTrace: [
      {
        stepIndex: 0,
        lineNumber: 1,
        explanation: "Trace text1 = 'abc' and text2 = 'ac' through the LCS routine.",
        variables: { text1: "abc", text2: "ac" },
        stdout: [],
        pointerChanges: { text1: "read", text2: "read" }
      },
      {
        stepIndex: 1,
        lineNumber: 2,
        explanation: "Measure the dimensions needed for the DP table.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2 },
        stdout: [],
        pointerChanges: { m: "write", n: "write" }
      },
      {
        stepIndex: 2,
        lineNumber: 3,
        explanation: "Create a zero-filled table with an extra base row and column.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, dp: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 3,
        lineNumber: 4,
        explanation: "Begin row i = 1, representing character 'a'.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, dp: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 4,
        lineNumber: 5,
        explanation: "Compare against text2 character 'a' at j = 1.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, j: 1, dp: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { j: "active" }
      },
      {
        stepIndex: 5,
        lineNumber: 6,
        explanation: "The characters match, so the subsequence can extend diagonally.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, j: 1, dp: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { text1: "read", text2: "read" }
      },
      {
        stepIndex: 6,
        lineNumber: 7,
        explanation: "Write dp[1][1] = 1 from the diagonal base value.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, j: 1, dp: [[0, 0, 0], [0, 1, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 7,
        lineNumber: 5,
        explanation: "Move to j = 2, comparing 'a' with 'c'.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, j: 2, dp: [[0, 0, 0], [0, 1, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { j: "active" }
      },
      {
        stepIndex: 8,
        lineNumber: 6,
        explanation: "The characters do not match.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, j: 2, dp: [[0, 0, 0], [0, 1, 0], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { text1: "read", text2: "read" }
      },
      {
        stepIndex: 9,
        lineNumber: 9,
        explanation: "Carry forward the best value from left or above into dp[1][2].",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 1, j: 2, dp: [[0, 0, 0], [0, 1, 1], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 10,
        lineNumber: 4,
        explanation: "Move to row i = 2 for character 'b'.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 2, j: 2, dp: [[0, 0, 0], [0, 1, 1], [0, 0, 0], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 11,
        lineNumber: 9,
        explanation: "After no matches in row 2, the best subsequence length remains 1.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 2, j: 2, dp: [[0, 0, 0], [0, 1, 1], [0, 1, 1], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 12,
        lineNumber: 4,
        explanation: "Move to row i = 3 for character 'c'.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 3, j: 2, dp: [[0, 0, 0], [0, 1, 1], [0, 1, 1], [0, 0, 0]] },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 13,
        lineNumber: 7,
        explanation: "The 'c' characters match, extending the diagonal result to 2.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 3, j: 2, dp: [[0, 0, 0], [0, 1, 1], [0, 1, 1], [0, 1, 2]] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 14,
        lineNumber: 10,
        explanation: "Return the bottom-right DP cell, which stores the final LCS length.",
        variables: { text1: "abc", text2: "ac", m: 3, n: 2, i: 3, j: 2, dp: [[0, 0, 0], [0, 1, 1], [0, 1, 1], [0, 1, 2]], result: 2 },
        stdout: ["2"],
        pointerChanges: { result: "write" }
      }
    ],
    drillCheckpoints: [
      { stepIndex: 5, promptType: "variable", target: "dp[1][1]", choices: ["0", "1", "2", "undefined"] },
      { stepIndex: 12, promptType: "variable", target: "dp[3][2]", choices: ["1", "2", "3", "0"] }
    ]
  },
  {
    id: "fibonacci",
    title: "Fibonacci DP",
    difficulty: "Easy",
    category: "Dynamic Programming",
    language: "python",
    codeSnippet: fibonacciCode,
    fullTrace: [
      {
        stepIndex: 0,
        lineNumber: 1,
        explanation: "Trace fib(5).",
        variables: { n: 5 },
        stdout: [],
        pointerChanges: { n: "read" }
      },
      {
        stepIndex: 1,
        lineNumber: 2,
        explanation: "n is greater than 1, so use the iterative DP path.",
        variables: { n: 5 },
        stdout: [],
        pointerChanges: { n: "read" }
      },
      {
        stepIndex: 2,
        lineNumber: 4,
        explanation: "Create a DP array from 0 through n.",
        variables: { n: 5, dp: [0, 0, 0, 0, 0, 0] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 3,
        lineNumber: 5,
        explanation: "Seed the first non-zero Fibonacci value.",
        variables: { n: 5, dp: [0, 1, 0, 0, 0, 0] },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 4,
        lineNumber: 6,
        explanation: "Start filling from i = 2.",
        variables: { n: 5, dp: [0, 1, 0, 0, 0, 0], i: 2 },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 5,
        lineNumber: 7,
        explanation: "dp[2] becomes dp[1] + dp[0] = 1.",
        variables: { n: 5, dp: [0, 1, 1, 0, 0, 0], i: 2 },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 6,
        lineNumber: 6,
        explanation: "Advance to i = 3.",
        variables: { n: 5, dp: [0, 1, 1, 0, 0, 0], i: 3 },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 7,
        lineNumber: 7,
        explanation: "dp[3] becomes 2.",
        variables: { n: 5, dp: [0, 1, 1, 2, 0, 0], i: 3 },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 8,
        lineNumber: 6,
        explanation: "Advance to i = 4.",
        variables: { n: 5, dp: [0, 1, 1, 2, 0, 0], i: 4 },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 9,
        lineNumber: 7,
        explanation: "dp[4] becomes 3.",
        variables: { n: 5, dp: [0, 1, 1, 2, 3, 0], i: 4 },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 10,
        lineNumber: 6,
        explanation: "Advance to i = 5.",
        variables: { n: 5, dp: [0, 1, 1, 2, 3, 0], i: 5 },
        stdout: [],
        pointerChanges: { i: "active" }
      },
      {
        stepIndex: 11,
        lineNumber: 7,
        explanation: "dp[5] becomes 5.",
        variables: { n: 5, dp: [0, 1, 1, 2, 3, 5], i: 5 },
        stdout: [],
        pointerChanges: { dp: "write" }
      },
      {
        stepIndex: 12,
        lineNumber: 8,
        explanation: "Return the final DP value.",
        variables: { n: 5, dp: [0, 1, 1, 2, 3, 5], i: 5, result: 5 },
        stdout: ["5"],
        pointerChanges: { result: "write" }
      }
    ],
    drillCheckpoints: [
      { stepIndex: 6, promptType: "variable", target: "dp[3]", choices: ["1", "2", "3", "5"] },
      { stepIndex: 10, promptType: "variable", target: "dp[5]", choices: ["3", "4", "5", "8"] }
    ]
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    category: "Graphs",
    language: "python",
    codeSnippet: courseScheduleCode,
    fullTrace: [
      {
        stepIndex: 0,
        lineNumber: 1,
        explanation: "Determine whether 4 courses can be completed from the prerequisite pairs.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] },
        stdout: [],
        pointerChanges: { num_courses: "read", prerequisites: "read" }
      },
      {
        stepIndex: 1,
        lineNumber: 2,
        explanation: "Create an adjacency list for every course.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [], "1": [], "2": [], "3": [] } },
        stdout: [],
        pointerChanges: { graph: "write" }
      },
      {
        stepIndex: 2,
        lineNumber: 3,
        explanation: "Initialize each course's indegree count.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [], "1": [], "2": [], "3": [] }, indegree: [0, 0, 0, 0] },
        stdout: [],
        pointerChanges: { indegree: "write" }
      },
      {
        stepIndex: 3,
        lineNumber: 4,
        explanation: "Read prerequisite pair [1, 0].",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [], "1": [], "2": [], "3": [] }, indegree: [0, 0, 0, 0], course: 1, pre: 0 },
        stdout: [],
        pointerChanges: { course: "active", pre: "active" }
      },
      {
        stepIndex: 4,
        lineNumber: 5,
        explanation: "Add an edge from prerequisite 0 to course 1.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [1], "1": [], "2": [], "3": [] }, indegree: [0, 0, 0, 0], course: 1, pre: 0 },
        stdout: [],
        pointerChanges: { graph: "write" }
      },
      {
        stepIndex: 5,
        lineNumber: 6,
        explanation: "Increment course 1's indegree because it depends on course 0.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [1], "1": [], "2": [], "3": [] }, indegree: [0, 1, 0, 0], course: 1, pre: 0 },
        stdout: [],
        pointerChanges: { indegree: "write" }
      },
      {
        stepIndex: 6,
        lineNumber: 6,
        explanation: "After processing all prerequisite pairs, courses 1 and 2 depend on 0, while 3 depends on 1 and 2.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 1, 1, 2], course: 3, pre: 2 },
        stdout: [],
        pointerChanges: { graph: "write", indegree: "write" }
      },
      {
        stepIndex: 7,
        lineNumber: 7,
        explanation: "Start with courses that have no prerequisites.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 1, 1, 2], queue: [0] },
        stdout: [],
        pointerChanges: { queue: "write" }
      },
      {
        stepIndex: 8,
        lineNumber: 8,
        explanation: "No courses have been completed yet.",
        variables: { num_courses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]], graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 1, 1, 2], queue: [0], visited: 0 },
        stdout: [],
        pointerChanges: { visited: "write" }
      },
      {
        stepIndex: 9,
        lineNumber: 10,
        explanation: "Pop course 0 from the queue.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 1, 1, 2], queue: [], visited: 0, node: 0 },
        stdout: [],
        pointerChanges: { queue: "write", node: "active" }
      },
      {
        stepIndex: 10,
        lineNumber: 11,
        explanation: "Mark course 0 as completed.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 1, 1, 2], queue: [], visited: 1, node: 0 },
        stdout: [],
        pointerChanges: { visited: "write" }
      },
      {
        stepIndex: 11,
        lineNumber: 13,
        explanation: "Remove 0 as a prerequisite for courses 1 and 2.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 0, 0, 2], queue: [], visited: 1, node: 0, nxt: 2 },
        stdout: [],
        pointerChanges: { indegree: "write" }
      },
      {
        stepIndex: 12,
        lineNumber: 15,
        explanation: "Both courses 1 and 2 are now available.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 0, 0, 2], queue: [1, 2], visited: 1, node: 0, nxt: 2 },
        stdout: [],
        pointerChanges: { queue: "write" }
      },
      {
        stepIndex: 13,
        lineNumber: 11,
        explanation: "Process courses 1 and 2, increasing visited to 3.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 0, 0, 2], queue: [], visited: 3, node: 2, nxt: 3 },
        stdout: [],
        pointerChanges: { visited: "write", queue: "write" }
      },
      {
        stepIndex: 14,
        lineNumber: 15,
        explanation: "Course 3 now has no remaining prerequisites and enters the queue.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 0, 0, 0], queue: [3], visited: 3, node: 2, nxt: 3 },
        stdout: [],
        pointerChanges: { indegree: "write", queue: "write" }
      },
      {
        stepIndex: 15,
        lineNumber: 16,
        explanation: "After visiting course 3, all courses have been completed.",
        variables: { num_courses: 4, graph: { "0": [1, 2], "1": [3], "2": [3], "3": [] }, indegree: [0, 0, 0, 0], queue: [], visited: 4, node: 3, result: true },
        stdout: ["true"],
        pointerChanges: { result: "write" }
      }
    ],
    drillCheckpoints: [
      { stepIndex: 5, promptType: "variable", target: "indegree[1]", choices: ["0", "1", "2", "3"] },
      { stepIndex: 11, promptType: "variable", target: "queue", choices: ["[]", "[0]", "[1,2]", "[3]"] },
      { stepIndex: 14, promptType: "variable", target: "visited", choices: ["2", "3", "4", "true"] }
    ]
  }
];

export function getProblemById(problemId: string) {
  return problems.find((problem) => problem.id === problemId) ?? problems[0];
}
