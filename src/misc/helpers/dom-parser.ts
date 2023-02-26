import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// TODO: type this stuff and clean it up

function getFromHTML(dom, item) {
  const element = dom.window.document.querySelector(`meta[property="og:${item}"]`);
  return element ? element.getAttribute('content') : null;
}

export default async function getCubeMeta(url) {
  const { hostname } = new URL(url);
  const res = await fetch(url);
  const cube: any = {};
  if (hostname.toLowerCase() === 'cubecobra.com' || hostname.toLowerCase() === 'cubeartisan.net') {
    if (res.url !== url) return null;
    const html = await res.text();
    const dom = new JSDOM(html);
    const rawTitle = getFromHTML(dom, 'title');
    cube.title = rawTitle.slice(rawTitle.indexOf(':') + 1).trim();
    cube.id = url.endsWith('/') ? url.slice(0, -1) : url.slice(url.lastIndexOf('/') + 1);
    cube.url = getFromHTML(dom, 'url');
    cube.thumbnail = getFromHTML(dom, 'image');
    cube.description = getFromHTML(dom, 'description');
    cube.pack = `https://cubecobra.com/cube/samplepackimage/${cube.id}/${Math.floor(Math.random() * 999999)}.png`;
  } else {
    const html = await res.text();
    const dom = new JSDOM(html);
    const rawTitle = getFromHTML(dom, 'title');
    cube.title = rawTitle.slice(rawTitle.indexOf('-') + 1, rawTitle.lastIndexOf('-')).trim();
    cube.url = url;
  }
  return cube;
}