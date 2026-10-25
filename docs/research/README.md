# Ten questions to answer from the brief

Answer these in order with the brief open, before any research and before any code. It takes about
five minutes. They carry no hint of any topic or design system, and they leave out what this template
already settles: the stack, the mock API, WCAG 2.2 AA, who and when on every action, the AI log and
the cut order.

## How to use it in the timebox

1. **Minute zero.** Read the brief once, then answer questions 1 to 8 in the brief's own words. Write
   the answers into the README's assumptions section. An unanswered question is a decision the AI
   will make for you, and it will usually make it differently from you.
2. **Question 9** names the key research area and the ADR: the one step where a wrong design costs
   the most and where a real alternative exists.
3. **Question 10** produces the two research questions to send to a research thread, each answerable
   with sources in 25 minutes, and the gaps in the brief. Each gap becomes a written assumption.
4. **Then write the brief's own list.** With these ten answered, write the brief-specific questions
   that remain, each with where to research it. That second list belongs in the brief's repo, not in
   this template.

## The questions

1. What must be delivered, by when, and who judges it?
2. Who is the user, and what must they have decided or done when they leave the screen?
3. What does the user most need to know first, and what is the costliest mistake they could make, to
   whom?
4. What does the user do from start to finish, step by step, and how does it end?
5. What are the entities, how do they relate (one to one, one to many, shared), and how many are on
   one screen in the normal and the worst case?
6. What was produced by a system and may be wrong, and what must the user judge about it, on what
   evidence?
7. Which statuses, grades or flags does the content carry (values, where each comes from), and which
   words could be confused with each other or with the screen's own states?
8. On what device and viewport is it used, with browser chrome subtracted, and what is in, out, and
   assumed?
9. Which step carries the most risk of being designed wrong, where does the decision depend on how
   something is shown, and what here has no standard pattern? That is the key research area and the
   ADR.
10. Which two questions about that step can a research thread answer with sources in 25 minutes, and
    what does the brief leave unanswered? Each gap becomes a written assumption or a brief-specific
    question.

## Adding a question

Add one only if it fits any brief without naming a topic, a screen or a design system, and the
template does not already answer it. A question that only makes sense for one brief belongs in that
brief's own list.
