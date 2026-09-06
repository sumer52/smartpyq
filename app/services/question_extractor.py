"""PDF Question Extraction Pipeline."""

import re
import os
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
import io

logger = logging.getLogger(__name__)


@dataclass
class ExtractedQuestion:
    question_number: str
    original_text: str
    normalized_text: str
    section: Optional[str] = None
    marks: Optional[int] = None
    question_type: str = "descriptive"


def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        import fitz
        doc = fitz.open(pdf_path)
        text_parts = []
        for page in doc:
            text = page.get_text("text")
            if text and text.strip():
                text_parts.append(text)
        doc.close()
        full_text = "\n\n".join(text_parts)
        if full_text.strip():
            return full_text
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}")
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            text_parts = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            return "\n\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {e}")


def clean_text(text: str) -> str:
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        s = line.strip()
        if not s:
            cleaned.append("")
            continue
        if re.match(r"^(page\s*\d+|copyright|all rights)", s, re.I):
            continue
        if re.match(r"^\d+$", s):
            continue
        cleaned.append(s)
    return "\n".join(cleaned)


def normalize_question(text: str) -> str:
    n = text.lower().strip()
    n = re.sub(r"\s+", " ", n)
    n = re.sub(r"^(q\.?\s*\d+[\.\)\]:\s]*)", "", n)
    n = re.sub(r"^(\d+[\.\)\]:\s]+)", "", n)
    n = re.sub(r"\(\s*\d+\s*(?:marks?|m)\s*\)?$", "", n, flags=re.I)
    n = re.sub(r"\b(please|kindly|note)\b", "", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


MARKS_RE = re.compile(r"\(\s*(\d+)\s*(?:marks?|m)\s*\)", re.I)


def detect_question_type(text: str) -> str:
    t = text.lower()
    if "choose" in t and ("correct" in t or "best" in t):
        return "mcq"
    if "multiple choice" in t:
        return "mcq"
    if any(w in t for w in ["define", "what is", "true or false"]):
        return "short_answer"
    return "descriptive"


def extract_questions_from_text(text: str) -> List[ExtractedQuestion]:
    questions = []
    cleaned = clean_text(text)

    # Q1. / Q1) format
    p1 = re.compile(
        r"(?i)(?:^|\n)\s*Q\.?\s*(\d+)[\.\)\]:\s]+(.+?)(?=(?:\n\s*Q\.?\s*\d+[\.\)\]:\s])|$)",
        re.DOTALL
    )
    matches = list(p1.finditer(cleaned))

    if matches:
        for m in matches:
            q_text = m.group(2).strip()
            mm = MARKS_RE.search(q_text)
            marks = int(mm.group(1)) if mm else None
            questions.append(ExtractedQuestion(
                question_number=m.group(1),
                original_text=q_text,
                normalized_text=normalize_question(q_text),
                marks=marks,
                question_type=detect_question_type(q_text)
            ))

    if not questions:
        # 1. / 1) format
        p2 = re.compile(
            r"(?:^|\n)\s*(\d+)[\.\)\]:\s]+(.+?)(?=(?:\n\s*\d+[\.\)\]:\s])|$)",
            re.DOTALL
        )
        for m in p2.finditer(cleaned):
            q_text = m.group(2).strip()
            if len(q_text) < 10:
                continue
            mm = MARKS_RE.search(q_text)
            marks = int(mm.group(1)) if mm else None
            questions.append(ExtractedQuestion(
                question_number=m.group(1),
                original_text=q_text,
                normalized_text=normalize_question(q_text),
                marks=marks,
                question_type=detect_question_type(q_text)
            ))

    if not questions:
        paras = [p.strip() for p in re.split(r"\n\s*\n", cleaned) if p.strip() and len(p.strip()) > 20]
        for i, p in enumerate(paras, 1):
            if re.match(r"^(university|college|department|exam|paper|instructions)", p, re.I):
                continue
            questions.append(ExtractedQuestion(
                question_number=str(i),
                original_text=p,
                normalized_text=normalize_question(p),
                question_type=detect_question_type(p)
            ))

    return questions


def extract_questions_from_pdf(pdf_path: str) -> List[ExtractedQuestion]:
    raw_text = extract_text_from_pdf(pdf_path)
    if not raw_text.strip():
        raise ValueError("No text could be extracted from the PDF")
    return extract_questions_from_text(raw_text)
