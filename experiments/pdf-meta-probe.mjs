// Проба: переносит ли Chrome <meta name="keywords|description|author"> в метаданные PDF
// и сохраняет ли pdf-lib закладки (outline) при повторном сохранении.
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<html><head><title>T</title><meta name="keywords" content="kw-123"><meta name="description" content="desc-1"><meta name="author" content="au"></head><body><h1>Один</h1><h2>Два</h2><p>Текст</p></body></html>`);
const pdf = await page.pdf({ format: 'A4', outline: true, tagged: true });
await browser.close();
const doc = await PDFDocument.load(pdf, { updateMetadata: false });
console.log({ title: doc.getTitle(), keywords: doc.getKeywords(), subject: doc.getSubject(), author: doc.getAuthor(), creator: doc.getCreator(), producer: doc.getProducer() });
console.log('Outlines in catalog:', !!doc.catalog.get(doc.catalog.context.obj('Outlines').constructor === undefined ? null : null));
const keys = doc.catalog.keys().map(String); console.log('catalog keys', keys);
doc.setKeywords(['ssot-sha256:abc']);
const out = await doc.save({ useObjectStreams: false });
const doc2 = await PDFDocument.load(out, { updateMetadata: false });
console.log('after save catalog keys', doc2.catalog.keys().map(String), doc2.getKeywords());
