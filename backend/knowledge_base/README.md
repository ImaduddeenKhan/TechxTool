# Knowledge Base

Place your curated PDF files in this directory. They will be automatically
loaded and embedded into ChromaDB on backend startup.

## Recommended PDFs

Add PDF documents containing tech-stack recommendations for common project
types such as:

- **Basic E-commerce** — Shopify alternatives, headless commerce stacks
- **Simple SaaS CRUD apps** — typical full-stack combos
- **Blog platforms** — static site generators, CMS comparisons
- **Admin dashboards** — low-code tools, component libraries
- **Data pipelines** — ETL frameworks, orchestration tools
- **AI/ML platforms** — model serving, vector databases

## Format

Any standard PDF will work. The system uses `pdfplumber` to extract text,
then chunks it into ~1000-character segments with 200-char overlap, and
stores each chunk in ChromaDB with metadata:

```json
{
  "source": "curated",
  "filename": "ecommerce_stacks.pdf",
  "chunk_index": 0
}
```

## Tips

- Keep PDFs focused on one project type each for better retrieval accuracy
- Include concrete technology names, pros/cons, and cost estimates
- Update the PDFs periodically to keep recommendations current
