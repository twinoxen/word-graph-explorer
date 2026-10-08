export interface Lesson {
  title:string;summary:string;paragraphs:string[];decision:string;
  question:string;choices:string[];correct:number;feedback:string[];
  visual:'requirements'|'validation'|'state'|'graph'|'representation'|'neighbors'|'memory'|'index'|'comparison'|'bfs'|'invariant'|'recovery';
}
export const CHAPTERS=[
  {title:'Conceptualize the problem.',description:'Turn the game rules into a precise search problem.'},
  {title:'Choose the data structures.',description:'Give every piece of information a clear representation.'},
  {title:'Choose and build the algorithm.',description:'Find a shortest route and explain why it is correct.'}
];
export const LESSONS:Lesson[]=[
  {
    title:'Define what the game must do.',summary:'A move validator and a shortest-path solver answer different questions.',visual:'requirements',
    paragraphs:[
      'Imagine that a product team asks you to build this game. Players begin with a seed word and change one letter at a time until they reach a goal. Before choosing an algorithm, separate the requests hidden inside that description.',
      'The move validator answers whether one proposed step is legal. A solver answers whether any sequence reaches the goal. A shortest-path solver adds a stronger requirement: return a legal sequence with the fewest transformations. A hint can run that solver from the player’s current word.',
      'The inputs are a vocabulary, a start word, and a goal word. The output is a sequence that includes both endpoints, or an explicit no-route result. Count moves as the number of words minus one. The vocabulary is part of the rules, so a familiar English word can still be unavailable in this game.'
    ],decision:'Write down the required output before choosing the algorithm. Finding a legal route does not prove that it is the shortest route.',
    question:'A hint promises the fewest remaining moves. What must its solver return?',choices:['It must return the first legal next word.','It must return a shortest route from the current word.','It must return the words in alphabetical order.'],correct:1,
    feedback:['A legal next word can lead into a detour or a disconnected branch. It does not establish the fewest remaining moves.','The hint needs a shortest route from the current word, because earlier player moves no longer determine the remaining distance.','Alphabetical order makes results reproducible, but it says nothing about the number of transformations.']
  },
  {
    title:'Translate the rules into a predicate.',summary:'A legal edge is a testable relationship between two words.',visual:'validation',
    paragraphs:[
      'Treat a proposed move as a predicate: given the current word and a candidate, return true only when every rule holds. Normalize the input first, then require vocabulary membership, equal lengths, and exactly one different character.',
      'Compare characters at the same position and count mismatches. CAT and COT have one mismatch, so they can connect. CAT and DOG have three mismatches. CAT and CAT have zero, so staying in place is not a move. Adding or deleting a letter also fails because the word length must stay fixed.',
      'This predicate is shared by gameplay and search. The interface should explain which rule failed, while the solver needs a reliable yes-or-no answer. Comparing two equal-length words takes O(L) character work, where L is the word length. An implementation can stop once it finds a second mismatch.'
    ],decision:'Use one definition of adjacency throughout the game. If the validator and solver disagree, a suggested route can contain moves the player cannot submit.',
    question:'Which candidate passes every rule when the current word is CAT?',choices:['COT passes every rule.','CAT passes every rule.','DOG passes every rule.'],correct:0,
    feedback:['COT belongs to the teaching vocabulary and differs from CAT only at the middle letter.','CAT differs in zero positions. A move must change exactly one letter.','DOG differs from CAT in three positions, so it needs intermediate words.']
  },
  {
    title:'Choose the information that defines a state.',summary:'Under these rules, the current word determines the available next moves.',visual:'state',
    paragraphs:[
      'A search state contains the information needed to decide what can happen next. In this game, two players standing on COT have the same legal next words even if they arrived through different histories. The vocabulary and movement rule are fixed, so the current word is enough to identify a vertex in the search.',
      'The displayed ladder still matters as player history, and a solver still needs search memory to avoid repeated work. Those are different responsibilities. We can merge repeated encounters with the same word instead of treating every complete history as a new state.',
      'This choice depends on the rules. If each move consumed a resource, or a player could use each letter only once, the current word alone would no longer describe the future. The remaining resources would also belong in the state. A personal ladder constraint would need its own treatment rather than being silently added to the global discovered set.'
    ],decision:'Merge states only when they have the same future possibilities. State design comes from the rules, not from the shape of the interface.',
    question:'If moves consume a limited supply of vowels, is the current word still a complete state?',choices:['The word alone is still enough.','The state must also include the remaining vowel supply.','The goal word becomes the only state.'],correct:1,
    feedback:['Two identical words with different remaining supplies can have different legal futures, so they cannot be merged blindly.','The remaining supply changes what can happen next, so it must be part of the state.','The goal describes success. It does not describe the player’s current possibilities.']
  },
  {
    title:'Derive a graph from the vocabulary.',summary:'Words become vertices, and legal transformations become edges.',visual:'graph',
    paragraphs:[
      'Start with one vertex for each vocabulary word. Connect two vertices when the adjacency predicate accepts the pair. The graph is undirected because changing A to O can be reversed by changing O to A. Each edge has the same cost of one move, so this is an unweighted shortest-path problem.',
      'A ladder is a path through this graph. The graph is not a tree: words can have several neighbors, paths can meet, and cycles can bring the search back to an earlier word. SUN is deliberately disconnected in the teaching dictionary, showing that valid endpoints do not guarantee a route.',
      'The drawn positions are only a layout. Two words close together on the screen are not necessarily adjacent, and the geometric length of a connector is not a game cost. The solver follows the adjacency rule, not the picture. Its distance is the number of edges along a route.'
    ],decision:'Separate the logical graph from its visual layout. A graph can exist implicitly even when no complete drawing or edge table has been built.',
    question:'What does a long connector on the drawing mean for the number of moves?',choices:['It costs more moves than a short connector.','It still represents one legal move.','It proves that the graph is a tree.'],correct:1,
    feedback:['The drawing has no weighted costs. Every legal connector costs one move regardless of its length on screen.','The connector represents one accepted transformation. Layout distance does not change its cost.','Connector length does not determine whether cycles exist or whether a graph is a tree.']
  },
  {
    title:'Choose a representation for the graph.',summary:'Vocabulary membership and neighbor lookup are separate operations.',visual:'representation',
    paragraphs:[
      'An array stores the vocabulary in an order and is easy to scan. A set answers membership questions without a linear search, with expected O(1) lookup in the usual hash-table model. An array membership check takes O(V) comparisons in the worst case, where V is the number of words. String hashing and equality also have a cost.',
      'An adjacency list maps each word to its legal neighbors. It makes traversal direct, but constructing every connection in advance costs preparation work and storage. For an undirected graph, each edge appears in both endpoints’ neighbor lists. The complete representation uses O(V + E) entries, where E counts edges.',
      'This app stores a vocabulary array and calculates neighbors during search by scanning it. It does not require a prebuilt adjacency list. That implicit graph is a simple choice for a small dictionary. Membership sets and stored neighbor lists solve different problems; adding a set does not automatically make neighbor generation fast.'
    ],decision:'Choose the representation for the operations you need. Faster membership does not eliminate the work of discovering adjacent words.',
    question:'What does a vocabulary set improve directly?',choices:['It improves membership checks.','It automatically stores every word’s neighbors.','It guarantees a shortest route.'],correct:0,
    feedback:['A set answers whether a candidate belongs to the vocabulary. Neighbor generation and path search still need their own designs.','A membership set does not encode adjacency. You still need a rule or an index to find neighbors.','A data structure alone does not establish shortest-path correctness. The traversal order matters.']
  },
  {
    title:'Generate neighbors before optimizing them.',summary:'The simplest neighbor finder compares one word with the dictionary.',visual:'neighbors',
    paragraphs:[
      'To expand CAT, scan the same-length vocabulary and apply the adjacency predicate to each candidate. Keep BAT and COT, and reject the others. The result is a list of words reachable in one move. This is neighbor generation, not a complete route search.',
      'A single lookup performs up to V word comparisons, each requiring up to L character comparisons. That gives an O(VL) bound. If the solver expands O(V) words and repeats the scan each time, neighbor generation can contribute O(V²L) work.',
      'The production solver first deduplicates, filters, and sorts its vocabulary. During expansion it skips already discovered words before checking adjacency, because it only needs new candidates. The teaching visual scans every candidate to expose the rule. Both approaches describe the same graph, but they do not perform exactly the same comparisons.'
    ],decision:'Start with a correct, inspectable neighbor finder. Measure or estimate repeated work before adding an index that costs memory and preparation time.',
    question:'Does one call to neighbors(CAT) return the complete route to DOG?',choices:['It returns the complete route.','It returns only the legal next words.','It returns every word in the dictionary.'],correct:1,
    feedback:['A neighbor finder knows only one-step connections. The solver must repeatedly expand words to assemble a route.','It returns words one edge away from CAT. Search combines these local relationships into a route.','The adjacency rule filters the vocabulary. Most dictionary words are not immediate neighbors.']
  },
  {
    title:'Give each piece of search memory a job.',summary:'The frontier, discovered set, parent map, and distances preserve different facts.',visual:'memory',
    paragraphs:[
      'The frontier contains discovered words that are waiting to be expanded. For BFS it is a first-in, first-out queue. The discovered set records every word already admitted to the search, including words still in that queue. The current word has been removed from the queue and is being processed.',
      'The parent map records the word that first led to each newly discovered word. The distance map records how many edges that discovery used. These structures support different questions: what comes next, what should be skipped, how did we get here, and how far is it from the start?',
      'Mark a word discovered before enqueueing it. Otherwise two already queued words can both add the same neighbor, causing duplicate work and ambiguous parent updates. The production animation also stores snapshots for playback. Those snapshots are presentation history, not a requirement of BFS, and copying them adds memory costs.'
    ],decision:'Keep discovered and expanded distinct. A word can be discovered without being the current word or having all its neighbors inspected yet.',
    question:'When should BFS mark a new word as discovered?',choices:['It should mark the word before adding it to the queue.','It should wait until the word leaves the queue.','It should wait until the goal is reached.'],correct:0,
    feedback:['Marking before enqueueing prevents another pending word from adding the same candidate again.','Waiting allows duplicate queue entries when two frontier words share a neighbor.','The search needs discovery tracking throughout traversal to handle cycles and converging paths.']
  },
  {
    title:'Trade preparation work for faster lookups.',summary:'Wildcard buckets reuse relationships across searches.',visual:'index',
    paragraphs:[
      'For each word, replace one position with a wildcard and store the word in that pattern’s bucket. COLD produces *OLD, C*LD, CO*D, and COL*. CORD shares CO*D with COLD. Words in a common bucket agree everywhere except the wildcard position.',
      'A lookup forms the L patterns for the current word, reads those buckets, removes the current word, and deduplicates candidates. It performs L bucket lookups, but not just L total operations. Creating strings, hashing keys, reading bucket entries, and processing candidates all require work.',
      'There are O(VL) word-to-bucket memberships. With straightforward length-L string creation, building the patterns can take O(VL²) character work, and storing pattern strings adds memory beyond memberships. A lookup similarly includes O(L²) pattern creation plus candidate processing. The exact costs depend on representation. This index is a proposed optimization; the game currently scans its vocabulary.'
    ],decision:'Reuse an index when repeated queries justify its build cost. A smaller count of bucket lookups is not a timing benchmark or a complete operation count.',
    question:'Do four bucket lookups mean that a four-letter neighbor search performs exactly four operations?',choices:['Yes, candidate processing is free.','No, pattern creation and candidate processing still cost work.','Yes, the dictionary size never matters again.'],correct:1,
    feedback:['Reading and deduplicating candidates still requires work, even after the right buckets have been found.','The lookups identify relevant buckets. Constructing keys and processing their contents add work and memory costs.','Large buckets can still contain many candidates. Indexing changes the work; it does not make every input equally cheap.']
  },
  {
    title:'Choose traversal order from the requirement.',summary:'DFS can find a route, while BFS guarantees the fewest equal-cost moves.',visual:'comparison',
    paragraphs:[
      'Depth-first search follows one branch as far as it can before backtracking. It uses recursion or a stack. Breadth-first search uses a queue to expand words by increasing distance. Both can answer reachability in a finite graph when they track discovered words correctly.',
      'In our teaching dictionary, alphabetical DFS follows CAT → BAT → BAD → BAG → BOG → COG → COT → DOT → DOG before it returns a route. BFS finds CAT → COT → COG → DOG in three moves. These routes come from the same adjacency rule and neighbor order. DFS’s first route is legal, but it is not shortest.',
      'DFS can search all possibilities to find a shortest route with extra work, so it is not incapable of solving the problem. BFS is the direct fit because every move costs one. Neither algorithm is always better. Both need O(V) search memory in the worst case on a graph; their practical frontier sizes differ with its shape.'
    ],decision:'Choose BFS because the product requires the fewest equal-cost moves. Choose an algorithm for its guarantee, not because the picture happens to look like a tree.',
    question:'The requirement is any legal route, with no shortest-path promise. Could DFS work?',choices:['DFS can work if it handles repeated states.','DFS cannot solve any word-ladder problem.','BFS is the only possible graph traversal.'],correct:0,
    feedback:['DFS can find a legal route while tracking discovered states. The missing guarantee is that its first route is shortest.','DFS can answer reachability. The shortest-path requirement is what makes BFS the more direct choice here.','Other traversals can find routes. BFS’s distance order provides the particular guarantee this game needs.']
  },
  {
    title:'Follow the BFS loop one operation at a time.',summary:'Code, queue contents, and recorded discoveries tell the same story.',visual:'bfs',
    paragraphs:[
      'Initialize the queue with the start word, mark it discovered, and record distance zero. While pending words remain, remove the oldest word. If it is the goal, reconstruct the route. Otherwise generate its neighbors and consider each one.',
      'Skip a neighbor that is already discovered. For a new neighbor, mark it discovered, record the current word as its parent, assign the current distance plus one, and append it to the back of the queue. The highlighted pseudocode is a simplified description of the production solver, and the display shows the state after each operation.',
      'The game uses an array with a moving head index rather than removing the first element with shift(). This avoids repeatedly moving the remaining array entries. Its queue snapshots show only the pending suffix. The teaching trace removes the first entry for clarity, so it is a demonstration rather than a performance implementation.'
    ],decision:'Enqueue at the back and dequeue at the front. Changing either end changes the traversal order and can destroy BFS’s distance guarantee.',
    question:'What happens if you take the newest queued word instead of the oldest?',choices:['The traversal still preserves BFS distance order.','The frontier behaves like a stack, so the BFS guarantee is lost.','The words become alphabetically sorted.'],correct:1,
    feedback:['A newest-first frontier can dive deeper before finishing the current layer. It does not preserve BFS’s distance invariant.','Taking the newest entry creates last-in, first-out behavior. That supports depth-first traversal rather than BFS.','Removing from one end does not sort the contents. It changes the traversal policy.']
  },
  {
    title:'Explain the shortest-path guarantee.',summary:'Queue order and first discovery preserve the smallest distance.',visual:'invariant',
    paragraphs:[
      'The invariant is that BFS processes words in nondecreasing distance from the start. Initially only distance zero is pending. When a word at distance k is expanded, every newly discovered neighbor gets distance k + 1 and goes behind the existing frontier.',
      'Therefore all pending words at distance k are processed before any word at distance k + 1 is expanded. If a shorter route to a newly discovered word existed, its previous vertex would have appeared in an earlier layer and would already have discovered that word. First discovery therefore records a shortest distance and a valid parent.',
      'Several parents can offer equally short routes; neighbor order decides which one is recorded first. The guarantee concerns route length, not a unique sequence. If moves have different costs, fewer edges may be more expensive. Dijkstra’s algorithm is a fit for nonnegative edge costs. BFS on a prebuilt adjacency graph takes O(V + E) traversal work; generating neighbors and recording snapshots are additional costs in this app.'
    ],decision:'State the assumptions behind the proof. BFS minimizes the number of edges when every edge has the same cost; it does not minimize arbitrary weighted costs.',
    question:'One route has two moves costing ten each, and another has three moves costing one each. What does unweighted BFS minimize?',choices:['It minimizes the number of moves.','It minimizes the total weighted cost.','It guarantees both answers are identical.'],correct:0,
    feedback:['BFS prefers two edges under the unweighted model, even though their weighted total is higher. A weighted solver would choose the cheaper three-edge route.','Ordinary BFS ignores those weights. Its distance measures edges, not their total cost.','Different costs break the equivalence between the fewest edges and the cheapest route.']
  },
  {
    title:'Recover a route and test its guarantees.',summary:'Parents explain the answer, and edge cases establish the solver’s contract.',visual:'recovery',
    paragraphs:[
      'At the goal, follow the parent map backward: DOG leads to COG, COG leads to COT, and COT leads to CAT. Reverse that sequence to produce the playable route. A visited list cannot replace the parent map because it also contains branches that are not on the solution.',
      'Test more than a successful example. Identical valid endpoints produce a one-word route and zero moves. A disconnected goal produces no route after the queue empties. Invalid endpoints need an explicit failure result. Cycles must terminate without duplicate discoveries, and multiple shortest routes may return different valid sequences.',
      'For every returned route, verify that its endpoints match the request, every word belongs to the vocabulary, and every consecutive pair differs by exactly one letter. To check the shortest-path guarantee, use small graphs with known distances or compare against an independent reference. The production solver’s playback snapshots can add O(V²) storage, while the core queue, discovered set, parents, and distances need O(V) storage.'
    ],decision:'Test the contract and the algorithm’s invariants. A single successful ladder does not prove that unreachable goals, cycles, and tied routes are handled correctly.',
    question:'A faulty solver overwrites a parent every time it sees a word. What should you change?',choices:['Keep the parent recorded on first discovery.','Sort the parent map alphabetically.','Recover the route from every visited word.'],correct:0,
    feedback:['Record a parent only when a word is first discovered. Later encounters must not replace the shortest-distance breadcrumb or create a parent cycle.','Sorting cannot repair an incorrect predecessor relationship. Parent links must represent actual first discoveries.','Visited words include other branches. They do not form a single connected solution route.']
  }
];
