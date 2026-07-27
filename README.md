# TibetanTranslation

This repository contains the Tibetan OCR / translation / proofreading workbench only.

## Included modules

- `tibetan-proofreading-app/`
  - Browser-based workbench for PDF review, OCR comparison, translation review, and export.
- `tibetan-ocr-core/`
  - Local Tibetan OCR service layer.
- `tibetan-translation-services/`
  - Local translation service layer.

## Not included

- AS译林 adapter or local mirror deployment
- `as-yilin-model-adapter/`
- `sutra-image-package-20260611-2159-server-runtime-amd64/`

## Local run

From the repository root:

```bash
./tibetan-proofreading-app/start_services.sh
```

Frontend:

```text
http://127.0.0.1:8790/tibetan-proofreading-app/
```

Stop services:

```bash
./tibetan-proofreading-app/stop_services.sh
```

## Workbench flow

```text
PDF / image upload
→ file type detection and text-layer check
→ page rendering and navigation
→ BDRC OCR per page
→ OCR vs source comparison
→ Tibetan-to-Chinese translation
→ manual correction and export
```

## Repository boundary

This repository is intended to be shareable with collaborators who only need the Tibetan OCR / translation workflow. Keep AS译林-specific content out of this repo so permissions stay scoped to the workbench only.

## Collaborator requirements

For collaborators, the minimum setup is:

- They only need to be able to run the OCR services in this repository.
- They do not need to install AS译林.
- BDRC OCR is the first-priority recognition source.
- If BDRC OCR quality is not good enough for a page or block, fall back to LLM Vision for comparison or replacement.
- If they can start `./tibetan-proofreading-app/start_services.sh` and reach the OCR / AI Vision endpoints, they can participate in development.

## Documentation

- `AGENTS.md` contains the project rules for this repository.
- `提示词历史.md` stores append-only prompt history.
- `任务重点整理/` stores one task-summary markdown per run.

## Notes

Large local PDFs, DOCX files, screenshots, runtime logs, Docker image archives, `.env`, and runtime `config.yaml` files should not be committed.
