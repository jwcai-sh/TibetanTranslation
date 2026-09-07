from __future__ import annotations

import io
import unittest
from unittest.mock import patch

import fitz
from fastapi.testclient import TestClient

from zeabur_app.main import app


def make_pdf() -> bytes:
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "server render")
    content = document.tobytes()
    document.close()
    return content


class FakeObject:
    def __init__(self, content: bytes):
        self.content = content

    def read(self) -> bytes:
        return self.content


class FakeBucket:
    def __init__(self, content: bytes):
        self.content = content

    def get_object(self, _key: str) -> FakeObject:
        return FakeObject(self.content)


class PdfRenderEndpointTests(unittest.TestCase):
    def test_renders_a_cloud_book_without_reuploading_the_pdf(self) -> None:
        pdf = make_pdf()
        client = TestClient(app)
        with patch("zeabur_app.main.read_json", return_value={"source_key": "books/book-1/source/source.pdf"}), patch(
            "zeabur_app.main.oss_bucket", return_value=FakeBucket(pdf)
        ):
            response = client.post("/api/render-pdf-page", data={"book_id": "book-1", "page": "1", "dpi": "100"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "image/png")
        self.assertTrue(response.content.startswith(b"\x89PNG\r\n\x1a\n"))

