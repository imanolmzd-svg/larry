# Use Cases — Larry

This document describes the **primary use cases** for Larry in its MVP form.

Larry is designed for **individual professionals** working with critical documents (contracts, PDFs, spreadsheets) who need **reliable answers with explicit sources**.

The type of document is irrelevant: Larry must behave consistently across all supported formats.

---

## Use Case 1 · Quickly understand a long document

**Situation**
I receive a long document (contract, report, technical PDF) and need to understand it without reading everything.

**Action**
- Upload the document.
- Ask specific questions about its content.

**Expected Result**
- Clear, concise answers.
- Every answer includes explicit sources.
- If the information is not present, Larry says so.

**Value**
- Saves time without sacrificing trust.

---

## Use Case 2 · Find specific information in a document

**Situation**
I need to locate a specific clause, definition, number, or section.

**Action**
- Ask a direct question (e.g. "What is the termination clause?", "What is the total amount?").

**Expected Result**
- Larry points to the exact relevant fragment.
- The referenced text is clearly visible.
- Sources identify the document and location.

**Value**
- Eliminates manual searching and misinterpretation.

---

## Use Case 3 · Verify whether something exists or not

**Situation**
I want to confirm whether a document mentions a specific condition.

**Action**
- Ask a binary or factual question.

**Expected Result**
- If present: answer + source.
- If not present: Larry explicitly states that the information does not appear in the documents.

**Value**
- High confidence in both "yes" and "no" answers.

---

## Use Case 4 · Work with structured data (Excel / CSV)

**Situation**
I upload spreadsheets containing structured data (prices, metrics, lists, historical records).

**Action**
- Ask questions about existing values or entries.

**Expected Result**
- Answers are based exclusively on the spreadsheet content.
- References include sheet name and cell/range when possible.
- No inference, extrapolation, or calculation beyond existing data.

**Value**
- Reliable access to structured information without manual lookup.

---

## Use Case 5 · Compare information across documents

**Situation**
I need to compare how different documents describe the same topic or data.

**Action**
- Ask a comparative question.

**Expected Result**
- Larry shows what each document states.
- Differences or inconsistencies are highlighted.
- Each statement is independently sourced.

**Value**
- Reduces risk caused by conflicting information.

---

## Use Case 6 · Reuse historical knowledge

**Situation**
I have previously uploaded documents and want to reuse their information later.

**Action**
- Ask questions based on existing documents.

**Expected Result**
- Larry searches across all documents owned by the user.
- Answers remain traceable and consistent over time.
- Full history of questions and answers is preserved.

**Value**
- Knowledge is retained and reusable.

---

## Use Case 7 · Justify decisions with sources

**Situation**
I need to support a decision or statement with evidence from documents.

**Action**
- Ask a question before communicating or deciding.

**Expected Result**
- Answer includes clear sources.
- Easy to reference or copy along with citations.

**Value**
- Confidence when communicating sensitive information.

---

## Use Case 8 · Know when an answer cannot be given

**Situation**
I ask a question that is not covered by the documents.

**Action**
- Ask a question outside the document scope.

**Expected Result**
- Larry clearly states that the information cannot be found.
- No guessing or speculative answers.

**Value**
- Prevents false certainty in critical contexts.

---

## Shared Principles Across All Use Cases

- Larry uses **only the user's documents**.
- All answers include **explicit sources**.
- Strict mode is always enabled.
- "No answer found" is a valid and expected outcome.
- Trust and traceability are prioritized over fluency.
- Interaction happens exclusively within the web application.

---

These use cases define the **expected behavior** of Larry in the MVP and serve as a reference for product, UX, and engineering decisions.
