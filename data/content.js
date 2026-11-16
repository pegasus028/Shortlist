/* The Shortlist — public content (applicants, questions, criteria, recommendations).
   Edit wording here, then re-record the voices: python3 tools/make-audio.py --prune
   The designer's notes (who is the red flag, each profile) are NOT in this file: they live in the
   Apps Script project (Notes.gs) and reach the teacher board only when the teacher reveals them. */
window.SL = {
  meta: {
    title: 'The Shortlist',
    programme: 'Horizon Scholars Programme',
    blurb: 'A Bangkok university is choosing students for its new Horizon Scholars Programme. Ten applicants were interviewed. There are three places, and the best of the three also wins the full scholarship.',
    version: '1.0.0'
  },

  questions: [
    { id: 'q1', label: 'Motivation', text: 'Tell us about yourself. Why are you applying to this programme?' },
    { id: 'q2', label: 'Weakness',   text: 'What is your greatest weakness?' },
    { id: 'q3', label: 'Teamwork',   text: 'Tell us about a time something went wrong in a team. What did you do?' }
  ],

  /* What a strong applicant shows. Used on the briefing, the card help sheet and the debrief. */
  criteria: [
    { id: 'motivation', name: 'Genuine motivation',  look: 'A real, specific reason for applying, not a slogan.' },
    { id: 'awareness',  name: 'Self-awareness',      look: 'A real weakness, and what the applicant is doing about it.' },
    { id: 'evidence',   name: 'Specific evidence',   look: 'Concrete examples, and what the applicant did personally.' },
    { id: 'reflection', name: 'Reflection',          look: 'What the applicant learned and now does differently.' },
    { id: 'integrity',  name: 'Teamwork and honesty', look: 'Respect for other people, and honest choices.' },
    { id: 'clarity',    name: 'Clear communication', look: 'The meaning is clear. Content matters more than perfect grammar.' }
  ],

  /* Warning signs from the MMI observer sheet. One serious one can outweigh a strong file. */
  redFlags: [
    'Chooses a dishonest or unethical action',
    'Blames other people',
    'Disrespectful or judgemental language',
    'Avoids the question or never decides',
    'Sounds memorised, not real',
    'Bluffs about something they do not know'
  ],

  /* Multiple-choice advice the panel gives to its bottom three. */
  recs: [
    { id: 'r1',  text: 'Give a specific example from your own life.' },
    { id: 'r2',  text: 'Explain what you did yourself, not only the team.' },
    { id: 'r3',  text: 'Say what you learned and what you do differently now.' },
    { id: 'r4',  text: 'Answer the question that was asked.' },
    { id: 'r5',  text: 'Name a real weakness and how you are working on it.' },
    { id: 'r6',  text: 'Explain why this programme, not any university.' },
    { id: 'r7',  text: 'Speak in your own words, not memorised phrases.' },
    { id: 'r8',  text: 'Take responsibility instead of blaming others or luck.' },
    { id: 'r9',  text: 'Be honest: never bend the rules to look successful.' },
    { id: 'r10', text: 'Show that you respect and include other people.' }
  ],

  /* Ten fictional applicants. 5 female (Sonia's voice), 5 male (Ryan's voice).
     Three answers each, 28–38 words, written as transcribed speech. Kong's small slips are deliberate. */
  candidates: [
    { id: 'c01', name: 'Fern', gender: 'F', answers: [
      'With three friends I started an online shop selling tote bags made from old school uniforms. We sold four hundred bags in a year. I want to study design and business, to turn waste into products.',
      'I am impatient, and I interrupt people when I have an idea. My friends pointed it out, so now I write my idea down and wait until the other person finishes. It does not always work yet.',
      'In our shop I decided alone to spend all our profit on a sewing machine. One friend was angry and left the team. The machine helped us, but I lost a friend. Now we vote on money.'
    ]},
    { id: 'c02', name: 'Ton', gender: 'M', answers: [
      'My parents think this programme is good for my future, and my cousin studied here. I am not sure what I want to do yet, but I think a good university will help me decide.',
      'I can be lazy. I often start my homework late at night and then rush it. My mother says I need more discipline. I think I will be better when I am at university.',
      'In a geography project I forgot to send my part, so our group was late. The teacher gave us one more day, and we finished it. In the end it was fine, and we got a B.'
    ]},
    { id: 'c03', name: 'Mint', gender: 'F', answers: [
      'Last summer I volunteered at our district health centre, helping Myanmar workers register. I saw people miss treatment because the forms were only in Thai. I want to study public policy, so that systems work for everyone.',
      'I say yes to everything. In M5 I joined four clubs and often worked until two in the morning. Now I keep one list, and I say no to at least one new request a week.',
      'In a history project I rewrote everyone’s slides the night before, because I thought they looked messy. My friends felt I did not trust them. I apologised, but I still find it hard to let go.'
    ]},
    { id: 'c04', name: 'Win', gender: 'M', answers: [
      'I run a peer-support page for students with exam stress. It has over three thousand followers, and two school counsellors now share our posts. I am applying because I want to build services that young people actually use.',
      'I sometimes take on too much myself. I have learned to share the work by giving each team member one clear goal and checking in every week. Our page now has five volunteer editors.',
      'The night before the science fair, our experiment failed. The judges mostly look at the graph, so I changed the last three results to match our prediction. We won silver. It taught me to stay calm under pressure.'
    ]},
    { id: 'c05', name: 'Ploy', gender: 'F', answers: [
      'I am a friendly person and I love working with people. I believe education can change the world, and this programme will help me reach my dream and make a positive difference in society.',
      'My weakness is that I care too much about other people. Sometimes I put their happiness before mine. But I think it is also a strength, because people know they can always trust me.',
      'In one group project we had a problem with communication. Some members did not reply in the chat. But in the end we talked together, solved the problem and learned that teamwork is very important.'
    ]},
    { id: 'c06', name: 'Kong', gender: 'M', answers: [
      'My family has small fish sauce factory in Chanthaburi. Last year I make a spreadsheet to track our stock, and now we throw away twenty per cent less. I want to learn how data can help small businesses.',
      'My English is not so strong, especially speaking. I listen to BBC podcast every morning on the bus, and I record myself once a week. It is slow, but I can see the progress.',
      'In robot club I connected the wrong battery and burned our motor two days before competition. I told the teacher immediately and paid half from my savings. Now I use a checklist before I switch anything on.'
    ]},
    { id: 'c07', name: 'Beam', gender: 'M', answers: [
      'Honestly, I only decided last year, after my grandmother had a stroke. I helped her with speech exercises every evening, and I became curious about how the brain recovers. I know I still have a lot to learn.',
      'I used to give up quickly. I quit guitar and swimming after a few months. This year I wanted to prove that I could finish something, so I completed a twelve-week online statistics course.',
      'In a chemistry project I did almost nothing for two weeks while my partner did the work. She was upset, and she was right. I apologised, wrote the first draft of the report and presented it myself.'
    ]},
    { id: 'c08', name: 'Namwan', gender: 'F', answers: [
      'Since I was a child, I have dreamed of studying at a world-class university. I am passionate and hard-working. I believe this programme is the perfect fit for my goals, and I will give one hundred per cent.',
      'I would say my greatest weakness is that I am a perfectionist. I always want everything to be excellent. I believe this makes me a reliable student, and I never give up on my goals.',
      'As class representative I organised our sports day. It was a great success and everyone enjoyed it. This experience taught me that with good leadership and positive thinking, any team can achieve its goals.'
    ]},
    { id: 'c09', name: 'Phum', gender: 'M', answers: [
      'For two years I have taught English to children at a temple school every Saturday. Some now answer tourists confidently. I want to study education, because I want to know why some methods work and others do not.',
      'I am quiet in big groups, so people think I have no ideas. To change this, I joined the drama club. I still get nervous, but I spoke at our school assembly last month.',
      'Our volunteer team planned a sports day, but nobody asked the head monk for permission, which was my job. We had to postpone it. I apologised, and now I repeat who does what before every meeting ends.'
    ]},
    { id: 'c10', name: 'Praew', gender: 'F', answers: [
      'I have been school council president, a national debate semi-finalist and a Model UN delegate. These experiences showed me that I am a natural leader, and this programme is the best place to develop future leaders.',
      'I find it hard to accept anything less than an A. Last term I rewrote one essay four times and missed debate practice. My coach told me that done is better than perfect, and I am learning that.',
      'When I led the council’s charity fair, sales were low on the first day. I changed the plan overnight, moved all the stalls, and we doubled our sales. I learned that a leader must act fast.'
    ]}
  ]
};
if (typeof module !== 'undefined') module.exports = window.SL;
