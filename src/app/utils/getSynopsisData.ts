export function getSynopsisData() {
  const defaultData = [
    { id: 1, title: "Act One - Opening", content: "Sarah Chen is at the top of her game. A Pulitzer-winning investigative journalist for the Washington Chronicle, she's built her career on exposing corruption and holding the powerful accountable. When she receives an encrypted USB drive containing classified documents, she thinks she's onto another major story." },
    { id: 2, title: "Act One - Part 2", content: "The documents point to a vast conspiracy involving arms deals, political assassinations, and a shadow network operating within the U.S. intelligence community. At the center of it all is a name she knows well: Marcus Kane, a former CIA operative who went rogue three years ago. Sarah has been trying to expose Kane's crimes for years, publishing article after article about his alleged activities. He's her white whale." },
    { id: 3, title: "Act One - Part 3", content: "But when Sarah starts following the leads in the documents, people around her start dying. Her source is found dead in an apparent suicide. Her editor receives threats. Someone is watching her every move, and they'll stop at nothing to keep the truth buried." },
    { id: 4, title: "Act Two - Opening", content: "Sarah is cornered in a parking garage by armed men when Marcus Kane appears out of nowhere to save her. He claims he's not the villain she's made him out to be—he's been investigating the same conspiracy for years, and now they're both targets. Sarah doesn't trust him, but she has no choice. They go on the run together." },
    { id: 5, title: "Act Two - Part 2", content: "As they piece together the puzzle, Sarah learns that Marcus was set up by someone inside the agency. The conspiracy goes deeper than either of them realized, involving high-ranking officials in multiple government agencies. The documents Sarah received were bait, designed to flush out both of them so they could be eliminated." },
    { id: 6, title: "Act Two - Part 3", content: "Despite their mutual distrust, Sarah and Marcus develop a grudging respect for each other. She realizes that many of the stories she wrote about him were based on planted intelligence. He was fighting the good fight all along, but she helped destroy his reputation. The guilt weighs on her as they race to stay alive." },
    { id: 7, title: "Act Three - Opening", content: "With time running out and their enemies closing in, Sarah and Marcus discover the conspiracy's true scope: a group of powerful individuals planning a false flag operation that would justify a new war and consolidate their power. The attack is set to happen in 48 hours." },
    { id: 8, title: "Act Three - Part 2", content: "They have evidence, but no one they can trust to deliver it to. Every channel is compromised. Sarah makes the bold decision to go public, using her platform and reputation to expose everything in a live broadcast. Marcus provides security and technical support, knowing that once the truth is out, there's no going back." },
    { id: 9, title: "Act Three - Part 3", content: "The broadcast is interrupted by armed forces attempting to stop them, leading to a tense standoff broadcast live to millions. In the end, Sarah gets the truth out, but at a tremendous cost. The conspiracy is exposed, but Marcus is seriously wounded in the firefight." },
    { id: 10, title: "Act Three - Conclusion", content: "In the aftermath, Sarah visits Marcus in the hospital. He's recovering, but his life will never be the same. Neither will hers. They've stopped the conspiracy, but they've also made powerful enemies. As Sarah leaves the hospital, she receives a message on her phone: \"This isn't over.\" She looks back at Marcus, and they exchange a knowing glance. The fight for truth never ends." }
  ];

  const savedContent = localStorage.getItem("contentData");
  if (savedContent) {
    try {
      const contentData = JSON.parse(savedContent);
      return contentData.synopsis || defaultData;
    } catch (e) {
      return defaultData;
    }
  }
  return defaultData;
}
