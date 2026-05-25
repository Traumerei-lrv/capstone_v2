export const missionScaffolds = {
  introduction: {
    key: 'introduction',
    missionId: 'introduction',
    title: 'Introduction to DSA',
    subtitle: 'Foundation lesson',
    description:
      'This introduction covers the core building blocks needed before deeper DSA topics. You will learn what data structures are, how algorithms work, and why ADTs help organize operations on data.',
    accent: '#0ea5e9',
    gradient: 'from-[#0ea5e9] via-[#2563eb] to-[#7c3aed]',
    stageLabel: 'Introduction Mission',
    rewardLabel: 'DSA Starter Pack',
    hint: 'Focus on key terms and how each concept connects to real program behavior.',
    introBlurb:
      'This introduction covers the core building blocks needed before deeper DSA topics. You will learn what data structures are, how algorithms work, and why ADTs help organize operations on data.',
    reviewBlurb: 'Review each subtopic and make sure you can explain the purpose of data structures, ADT, and algorithms.',
    preTest: {
      title: 'Pre-test',
      prompt: 'What best describes a data structure?',
      choices: ['A way to store and organize data', 'A type of screen layout', 'A network cable format', 'A compiler setting'],
      correctIndex: 0,
      questions: [
        {
          prompt: 'What best describes a data structure?',
          choices: ['A way to store and organize data', 'A type of screen layout', 'A network cable format', 'A compiler setting'],
          correctIndex: 0,
          explanation: 'Data structures define how data is arranged so programs can use it efficiently.',
        },
        {
          prompt: 'Which type is considered linear?',
          choices: ['Array', 'Tree', 'Graph', 'Heap'],
          correctIndex: 0,
          explanation: 'Arrays are linear because elements are arranged in sequence.',
        },
        {
          prompt: 'What does ADT stand for?',
          choices: ['Abstract Data Type', 'Advanced Data Table', 'Applied Data Tool', 'Array Definition Type'],
          correctIndex: 0,
          explanation: 'ADT means Abstract Data Type.',
        },
        {
          prompt: 'Which is a common ADT operation?',
          choices: ['Insert', 'Compile', 'Render', 'Install'],
          correctIndex: 0,
          explanation: 'Insert is one of the common ADT operations.',
        },
        {
          prompt: 'What is an algorithm?',
          choices: ['A step-by-step set of instructions', 'A data container', 'A computer brand', 'A file extension'],
          correctIndex: 0,
          explanation: 'An algorithm is a clear sequence of steps used to solve a problem.',
        },
      ],
    },
    postTest: {
      title: 'Post-test',
      prompt: 'After this introduction lesson, what should you understand clearly?',
      choices: ['Data structures, ADT concepts, operations, and algorithms', 'Only one quiz question', 'Only the mission score', 'Only the navigation buttons'],
      correctIndex: 0,
    },
    introPoints: [
      'Data structures store and organize data.',
      'ADT defines behavior, not implementation details.',
      'Algorithms are step-by-step procedures for solving problems.',
    ],
    introSubtopics: [
      {
        title: 'What is a Data Structure?',
        terms: ['Definition', 'Purpose', 'Example'],
        explanation: 'A data structure is a way of storing and organizing data so it can be used efficiently.',
        simpleExplanation: 'Data structures help programs arrange data in a useful format. They make it easier to add, access, update, and remove information.',
        termDetails: {
          Definition: 'A data structure is a special format used to store and organize data.',
          Purpose: 'The purpose of a data structure is to help programs manage data efficiently.',
          Example: 'A list of student names, a queue of customers, or a folder system can be represented using data structures.',
        },
      },
      {
        title: 'Types of Data Structures',
        terms: ['Linear', 'Non-Linear'],
        explanation: 'Data structures can be grouped based on how elements are stored and accessed.',
        simpleExplanation: 'Linear data structures arrange elements in sequence, while non-linear data structures connect elements in a more complex way.',
        termDetails: {
          Linear: 'Linear data structures store or access elements in order. Examples include arrays, linked lists, stacks, and queues.',
          'Non-Linear': 'Non-linear data structures are not arranged in a simple sequence. Examples include trees and graphs.',
        },
      },
      {
        title: 'Abstract Data Type',
        terms: ['Definition', 'Public Part', 'Private Part'],
        explanation: 'An Abstract Data Type, or ADT, describes what data can do without focusing on how it is coded.',
        simpleExplanation: 'ADT focuses on the behavior of data. It explains what operations are allowed while hiding the actual implementation.',
        termDetails: {
          Definition: 'An ADT is a logical description of how data is viewed and what operations are allowed.',
          'Public Part': 'The public part shows the data and operations that users can access.',
          'Private Part': 'The private part hides the internal representation and implementation.',
        },
      },
      {
        title: 'Benefits of ADT',
        terms: ['Readable', 'Reusable', 'Changeable'],
        explanation: 'ADTs make programs easier to understand, reuse, and update.',
        simpleExplanation:
          'Because ADTs separate the operation from the implementation, developers can change how data works internally without changing the whole program.',
        termDetails: {
          Readable: 'ADTs make code easier to understand because operations are clearly defined.',
          Reusable: 'ADTs can be used again in future programs.',
          Changeable: 'The implementation of an ADT can be changed without affecting the program that uses it.',
        },
      },
      {
        title: 'ADT Operations',
        terms: ['Initialize', 'Add', 'Access', 'Remove'],
        explanation: 'This subtopic explains the basic actions that can be performed on an Abstract Data Type.',
        simpleExplanation:
          'ADT operations are actions used to prepare, add, access, and remove data. These operations describe what the data structure can do without showing how it is implemented.',
        termDetails: {
          Initialize: 'Initialize means preparing or creating the data structure before using it.',
          Add: 'Add means placing a new item into the data structure.',
          Access: 'Access means retrieving or viewing an item stored in the data structure.',
          Remove: 'Remove means deleting an item from the data structure.',
        },
      },
      {
        title: 'Common ADTs',
        terms: ['Stack', 'Queue', 'Tree', 'Graph'],
        explanation: 'Different ADTs are used for different ways of organizing and processing data.',
        simpleExplanation: 'Each ADT has its own behavior. Some follow order, some use hierarchy, and others use connections between data.',
        termDetails: {
          Stack: 'A stack follows Last-In, First-Out. The last item added is the first item removed.',
          Queue: 'A queue follows First-In, First-Out. The first item added is the first item removed.',
          Tree: 'A tree represents hierarchical data using parent and child relationships.',
          Graph: 'A graph uses vertices and edges to show relationships between data.',
        },
      },
      {
        title: 'What is an Algorithm?',
        terms: ['Definition', 'Steps', 'Example'],
        explanation: 'An algorithm is a step-by-step set of instructions used to solve a problem.',
        simpleExplanation:
          'Algorithms guide how a task should be completed. A good algorithm has clear steps, accepts input, produces output, and eventually stops.',
        termDetails: {
          Definition: 'An algorithm is a step-by-step set of instructions executed in sequence to solve a problem.',
          Steps: 'The steps of an algorithm must be clear and arranged in the correct order.',
          Example: 'A sorting algorithm arranges numbers from lowest to highest by following a specific sequence of steps.',
        },
      },
      {
        title: 'Algorithm Characteristics',
        terms: ['Finiteness', 'Definiteness', 'Input', 'Output', 'Uniqueness'],
        explanation: 'A good algorithm must follow certain characteristics to work correctly.',
        simpleExplanation:
          'An algorithm should be clear, have valid input, produce output, stop after a number of steps, and make each step depend on the given data or previous result.',
        termDetails: {
          Finiteness: 'The algorithm must stop after a specified number of steps.',
          Definiteness: 'Each instruction must be clear and unambiguous.',
          Input: 'The algorithm may receive zero or more well-defined data before it begins.',
          Output: 'The algorithm must produce one or more results.',
          Uniqueness: 'The result of each step depends on the input or the result of the previous step.',
        },
      },
    ],
    visualNodes: ['Data', 'Structure', 'Operation', 'Algorithm'],
    codeStarter: ['// Introduction mission starter', 'const topic = "Introduction to DSA";', 'console.log(topic);'].join('\n'),
    codeHint: 'Code editor content can be updated per topic.',
    problem: {
      title: 'Problem: Identify the concept',
      prompt: 'Given a short scenario, identify whether it describes a data structure, an ADT, an operation, or an algorithm.',
      starter: ['// Write your answer mapping here', 'const answer = {};', '', 'console.log(answer);'].join('\n'),
      hint: 'Look at whether the statement describes storage, abstract behavior, actions, or step-by-step logic.',
      requiredFragments: ['const', 'answer'],
      solutionNote: 'A correct answer classifies each scenario into the right concept category.',
    },
  },
  recursion: {
    key: 'recursion',
    missionId: 'recursion',
    title: '02 Recursion',
    subtitle: 'Concept foundation',
    description: 'Understand recursion clearly before moving to code implementation.',
    accent: '#4d8ecb',
    gradient: 'from-[#2b67ad] via-[#4d8ecb] to-[#8b5cf6]',
    stageLabel: 'Recursion Mission',
    rewardLabel: 'Stack Mastery Pack',
    hint: 'Focus on how recursive calls repeat, how they stop, and how each call moves toward a base case.',
    introBlurb: 'This lesson explains recursion conceptually using clear terms and guided examples before writing code.',
    reviewBlurb: 'Post-test review will point back to introduction and visualization steps.',
    preTest: {
      title: 'Pre-test',
      prompt: 'Which idea best matches recursion?',
      choices: ['A function that repeats by calling itself', 'A loop with a fixed counter', 'A list of values in order', 'A class that stores data'],
      correctIndex: 0,
      questions: [
        {
          prompt: 'Which idea best matches recursion?',
          choices: ['A function that repeats by calling itself', 'A loop with a fixed counter', 'A list of values in order', 'A class that stores data'],
          correctIndex: 0,
          explanation: 'Recursion is when a function calls itself to solve smaller instances of the same problem.',
        },
        {
          prompt: 'What is the base case used for?',
          choices: ['To stop the recursive calls', 'To start a loop', 'To store input values', 'To print the answer only'],
          correctIndex: 0,
          explanation: 'The base case defines when the recursion should stop to avoid infinite calls.',
        },
        {
          prompt: 'What happens when the base case is never reached?',
          choices: ['The function keeps calling itself', 'The function turns into a loop', 'The program always finishes', 'The result is always zero'],
          correctIndex: 0,
          explanation: 'If there is no base case reached, recursion continues until the call stack overflows or the program crashes.',
        },
        {
          prompt: 'Why is recursion useful?',
          choices: ['It can simplify repeating patterns', 'It removes the need for any input', 'It only works on text files', 'It replaces all variables'],
          correctIndex: 0,
          explanation: 'Recursion can make code easier to write and read for problems that naturally divide into similar subproblems.',
        },
        {
          prompt: 'What must every recursive function have?',
          choices: ['A base case', 'A timer', 'A database', 'A screen refresh'],
          correctIndex: 0,
          explanation: 'A base case is necessary to terminate recursion; without it calls never end.',
        },
      ],
    },
    postTest: {
      title: 'Post-test',
      prompt: 'After this lesson, what should a review of recursion focus on?',
      choices: ['Introduction and visualization', 'Only the first question', 'Only the progress bar', 'Only the reward card'],
      correctIndex: 0,
    },
    introPoints: [
      'Recursion is when a function calls itself to solve a problem.',
      'A base case is required so recursion can stop.',
      'Each recursive step should move the problem toward the base case.',
    ],
    introSubtopics: [
      {
        title: 'What is Recursion?',
        terms: ['Recursion', 'Recursive function', 'Function calls itself'],
        explanation:
          'Recursion is a process where a function calls itself once or multiple times to solve a problem. Any function that calls itself is called a recursive function.',
        simpleExplanation: 'Recursion happens when a function repeats by calling itself.',
        guideText:
          'A recursive function solves a problem by doing the same process again on a smaller or simpler version of the problem.',
      },
      {
        title: 'Types of Recursive Calls',
        terms: ['Direct recursion', 'Indirect recursion', 'Infinite recursion'],
        explanation:
          'Direct recursion happens when a method directly calls itself. Indirect recursion happens when a method calls another method, and that method eventually calls the original method again. Infinite recursion happens when a recursive function fails to stop.',
        simpleExplanation:
          'Direct recursion calls itself directly. Indirect recursion goes through another function first. Infinite recursion keeps repeating without stopping.',
        guideText:
          'A recursive process must have a way to stop. Without a stopping condition, the function may continue calling itself forever.',
      },
      {
        title: 'Parts of a Recursive Algorithm',
        terms: ['Base case', 'Change of state', 'Recursive call'],
        explanation:
          'A recursive algorithm must have three important parts. First, it must have a base case, which is the condition that allows the recursion to stop. Second, it must change its state and move toward the base case. Third, it must call itself recursively.',
        simpleExplanation: 'Every recursion needs a stopping point, a change, and a self-call.',
        guideText:
          'The base case prevents infinite recursion. The change of state moves the problem closer to that base case. The recursive call repeats the process.',
      },
      {
        title: 'Recursion vs Iteration',
        terms: ['Recursion', 'Iteration', 'Looping', 'Base case', 'Condition', 'Stack overflow'],
        explanation:
          'Iteration is a process of repeating a set of instructions, also known as looping. Recursion stops when a base case is reached, while iteration stops when a condition becomes false. Each recursive call requires extra memory space, while iteration does not require extra memory space for repeated calls. Infinite recursion may cause stack overflow.',
        simpleExplanation: 'Recursion repeats by calling itself. Iteration repeats using a loop.',
        guideText:
          'Both recursion and iteration repeat actions, but they repeat in different ways. Recursion uses repeated function calls, while iteration uses loops.',
      },
      {
        title: 'Types of Recursion',
        terms: ['Linear recursion', 'Tail recursion', 'Binary recursion', 'Mutual recursion'],
        explanation:
          'Linear recursion happens when a function calls itself once each time it is invoked. Tail recursion happens when the recursive call is the last operation of the function. Binary recursion happens when the function calls itself twice. Mutual recursion happens when functions work in a pair or group by calling one another.',
        simpleExplanation: 'The type of recursion depends on how the function calls itself.',
        guideText:
          'Some recursive functions call themselves once, some call themselves twice, and some work together with other functions.',
      },
    ],
    introMockData: [],
    visualNodes: ['Base Case', 'Recursive Call', 'Return Path'],
    recursionVisualization: {
      functionLabel: 'countdown(n)',
      inputValue: 3,
      frameDurationMs: 1300,
      steps: [
        {
          phase: 'call',
          label: 'countdown(3)',
          caption: 'Recursive call begins with countdown(3).',
        },
        {
          phase: 'call',
          label: 'countdown(2)',
          caption: 'State changes from 3 to 2.',
        },
        {
          phase: 'call',
          label: 'countdown(1)',
          caption: 'State changes from 2 to 1.',
        },
        {
          phase: 'base',
          label: 'countdown(0)',
          caption: 'Base case reached. Stop recursive calls.',
        },
        {
          phase: 'return',
          label: 'countdown(0) returns',
          caption: 'Return starts from the base case.',
        },
        {
          phase: 'return',
          label: 'countdown(1) finishes',
          caption: 'The waiting call for countdown(1) finishes.',
        },
        {
          phase: 'return',
          label: 'countdown(2) finishes',
          caption: 'The waiting call for countdown(2) finishes.',
        },
        {
          phase: 'return',
          label: 'countdown(3) finishes',
          caption: 'Return reaches the first call and recursion completes.',
        },
      ],
    },
    codeStarter: ['function recurse(value) {', '  return value;', '}'].join('\n'),
    codeHint: 'Code editor content can be updated per topic.',
    problem: {
      title: 'Problem: Complete the recursion',
      prompt: 'Finish the function so it counts down from n to 1 using recursion.',
      starter: ['function countDown(n) {', '  // add base case and recursive step', '}', '', 'countDown(3);'].join('\n'),
      hint: 'You need a base case and a recursive call that reduces the number.',
      requiredFragments: ['if', 'countDown(n - 1)', 'return'],
      solutionNote: 'A correct answer should stop at the base case and call itself with a smaller value.',
    },
  },
  iteration: {
    key: 'iteration',
    missionId: 'iteration',
    title: 'Iteration',
    subtitle: 'Lesson Module',
    description: 'Loop-based lesson content.',
    accent: '#22c55e',
    gradient: 'from-[#0ea5e9] via-[#22c55e] to-[#f59e0b]',
    stageLabel: 'Iteration Mission',
    rewardLabel: 'Loop Builder Pack',
    hint: 'This topic is currently locked.',
    introBlurb: 'This topic is currently locked.',
    reviewBlurb: 'Post-test review will point back to introduction and visualization steps.',
    preTest: {
      title: 'Pre-test',
      prompt: 'Which pattern fits iteration best?',
      choices: ['Repeating steps with a loop', 'Calling the same function again', 'Storing nodes in links', 'Writing a one-time note'],
      correctIndex: 0,
      questions: [
        {
          prompt: 'Which pattern fits iteration best?',
          choices: ['Repeating steps with a loop', 'Calling the same function again', 'Storing nodes in links', 'Writing a one-time note'],
          correctIndex: 0,
          explanation: 'Iteration uses loops to repeat a block of code until a condition is met.',
        },
        {
          prompt: 'Which keyword often starts a loop?',
          choices: ['for', 'return', 'class', 'breakpoint'],
          correctIndex: 0,
          explanation: 'Keywords like `for` and `while` commonly start loops that perform iteration.',
        },
        {
          prompt: 'What is the purpose of a loop condition?',
          choices: ['To decide when the loop stops', 'To store the final result only', 'To create a new function', 'To make the screen bigger'],
          correctIndex: 0,
          explanation: 'The loop condition determines whether the loop continues or finishes.',
        },
        {
          prompt: 'Which is a loop counter?',
          choices: ['A variable that tracks iterations', 'A function that ends recursion', 'A file name', 'An image asset'],
          correctIndex: 0,
          explanation: 'A loop counter is a variable that keeps track of how many times the loop has run.',
        },
        {
          prompt: 'Why use iteration?',
          choices: ['To repeat work efficiently', 'To remove all variables', 'To avoid any output', 'To turn code into text'],
          correctIndex: 0,
          explanation: 'Iteration repeats tasks with minimal code and is efficient for many repeated operations.',
        },
      ],
    },
    postTest: {
      title: 'Post-test',
      prompt: 'What should the review cover after the iteration lesson?',
      choices: ['Introduction and visualization', 'Only the answers you missed', 'Only the first stage', 'Only the final score'],
      correctIndex: 0,
    },
    introPoints: ['Loop overview', 'Iteration objectives', 'Topic walkthrough'],
    visualNodes: ['Start', 'Condition', 'Update', 'Repeat'],
    codeStarter: ['for (let i = 0; i < 3; i += 1) {', '  console.log(i);', '}'].join('\n'),
    codeHint: 'Code editor content can be updated per topic.',
    problem: {
      title: 'Problem: Sum with a loop',
      prompt: 'Write a loop that adds numbers from 1 to 5 and stores the total in sum.',
      starter: ['let sum = 0;', '', '// write your loop here', '', 'console.log(sum);'].join('\n'),
      hint: 'You need a loop, a counter, and an addition step.',
      requiredFragments: ['for', 'sum +=', '5'],
      solutionNote: 'A correct answer loops from 1 to 5 and increases sum each time.',
    },
  },
  'linked-list': {
    key: 'linked-list',
    missionId: 'linked-list',
    title: 'Linked List',
    subtitle: 'Lesson Module',
    description: 'Linked list lesson content.',
    accent: '#ec4899',
    gradient: 'from-[#8b5cf6] via-[#ec4899] to-[#f97316]',
    stageLabel: 'Linked List Mission',
    rewardLabel: 'Pointer Flow Pack',
    hint: 'This topic is currently locked.',
    introBlurb: 'This topic is currently locked.',
    reviewBlurb: 'Post-test review will point back to introduction and visualization steps.',
    preTest: {
      title: 'Pre-test',
      prompt: 'What best describes a linked list?',
      choices: ['A chain of nodes connected by pointers', 'A single value stored in a table', 'A loop that counts upward', 'A text file with labels'],
      correctIndex: 0,
      questions: [
        {
          prompt: 'What best describes a linked list?',
          choices: ['A chain of nodes connected by pointers', 'A single value stored in a table', 'A loop that counts upward', 'A text file with labels'],
          correctIndex: 0,
          explanation: 'A linked list is a sequence of nodes where each node points to the next node in the list.',
        },
        {
          prompt: 'What does each node usually store?',
          choices: ['A value and a reference to the next node', 'Only the entire list', 'A loop counter', 'A keyboard shortcut'],
          correctIndex: 0,
          explanation: 'Nodes typically hold a value and a pointer/reference to the next node in the list.',
        },
        {
          prompt: 'What is the head of a linked list?',
          choices: ['The first node', 'The last node', 'The number of nodes', 'The memory address of the screen'],
          correctIndex: 0,
          explanation: 'The head is the first node of the list and is the entry point for traversals.',
        },
        {
          prompt: 'What does a pointer do?',
          choices: ['Points to another node in memory', 'Runs the program faster by itself', 'Prints the output', 'Creates a loop automatically'],
          correctIndex: 0,
          explanation: 'Pointers reference the location of another node, allowing traversal from one node to the next.',
        },
        {
          prompt: 'What happens at the end of the list?',
          choices: ['The next pointer is null', 'The list becomes a tree', 'The value is doubled', 'The node becomes a loop'],
          correctIndex: 0,
          explanation: 'The end of a linked list is usually represented by a null/none pointer indicating no further nodes.',
        },
      ],
    },
    postTest: {
      title: 'Post-test',
      prompt: 'What should the review cover after the linked list lesson?',
      choices: ['Introduction and visualization', 'Only the first node', 'Only the reward card', 'Only the sidebar'],
      correctIndex: 0,
    },
    introPoints: ['Node structure', 'Pointer explanation', 'Traversal example'],
    visualNodes: ['Head', 'Node', 'Node', 'Null'],
    codeStarter: ['class Node {', '  constructor(value) {', '    this.value = value;', '  }', '}'].join('\n'),
    codeHint: 'Code editor content can be updated per topic.',
    problem: {
      title: 'Problem: Count the nodes',
      prompt: 'Complete the function so it counts how many nodes are in the linked list.',
      starter: ['function countNodes(head) {', '  let count = 0;', '  // traverse the list', '  return count;', '}'].join('\n'),
      hint: 'Move through each node until you reach null.',
      requiredFragments: ['while', 'current', 'count++'],
      solutionNote: 'A correct answer walks through the list and increments count for every node.',
    },
  },
};

export function getMissionScaffold(key) {
  return missionScaffolds[key] || missionScaffolds.recursion;
}
