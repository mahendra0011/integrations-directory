import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const SUPPORTED_IMAGE_RE = /\.(png|jpe?g|webp)$/i;

function toPublicSrc(rootDir, filePath) {
  const publicDir = path.join(rootDir, 'public');
  const relative = path.relative(publicDir, filePath).replace(/\\/g, '/');
  return '/' + relative;
}

function publicSrcToFile(rootDir, src) {
  if (!isLocalPublicImage(src)) return null;
  const relative = String(src).startsWith('/') ? String(src).slice(1) : String(src);
  return path.join(rootDir, 'public', relative);
}

export function isLocalPublicImage(src) {
  return typeof src === 'string'
    && !/^https?:\/\//i.test(src)
    && SUPPORTED_IMAGE_RE.test(src);
}

export function getPublicImageSrcs(rootDir) {
  const publicIntegrationsDir = path.join(rootDir, 'public', 'integrations');
  const srcs = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && SUPPORTED_IMAGE_RE.test(entry.name)) {
        srcs.push(toPublicSrc(rootDir, fullPath));
      }
    }
  }

  walk(publicIntegrationsDir);
  return srcs;
}

function readHeaderQuality(filePath) {
  const buffer = fs.readFileSync(filePath);
  const quality = {
    width: 0,
    height: 0,
    colors: 999,
    avg: 128,
    size: buffer.length,
    error: '',
  };

  if (buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    quality.width = buffer.readUInt32BE(16);
    quality.height = buffer.readUInt32BE(20);
    return quality;
  }

  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    quality.width = 640;
    quality.height = 360;
    return quality;
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3 && offset + 8 < buffer.length) {
        quality.height = buffer.readUInt16BE(offset + 5);
        quality.width = buffer.readUInt16BE(offset + 7);
        return quality;
      }
      offset += 2 + length;
    }
  }

  quality.error = 'Unsupported image header';
  return quality;
}

function fallbackImageQuality(rootDir, srcs) {
  const map = new Map();
  for (const src of srcs) {
    const filePath = publicSrcToFile(rootDir, src);
    if (!filePath || !fs.existsSync(filePath)) continue;
    try {
      map.set(src, {
        src,
        path: filePath,
        ...readHeaderQuality(filePath),
      });
    } catch (error) {
      map.set(src, {
        src,
        path: filePath,
        width: 0,
        height: 0,
        colors: 0,
        avg: 0,
        size: 0,
        error: error.message,
      });
    }
  }
  return map;
}

export function getLocalImageQuality(rootDir, srcs) {
  const unique = [...new Set(srcs.filter(isLocalPublicImage))];
  if (!unique.length) return new Map();

  const items = unique
    .map((src) => ({ src, path: publicSrcToFile(rootDir, src) }))
    .filter((item) => item.path && fs.existsSync(item.path));

  if (!items.length) return new Map();
  if (process.platform !== 'win32') return fallbackImageQuality(rootDir, unique);

  const tempPath = path.join(rootDir, `.tmp-image-quality-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(tempPath, JSON.stringify(items), 'utf8');

  const script = `
$InputJson = $args[0]
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$items = Get-Content -Raw -LiteralPath $InputJson | ConvertFrom-Json
$result = @()
foreach ($item in $items) {
  $img = $null
  $bmp = $null
  try {
    $file = Get-Item -LiteralPath $item.path
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    $bmp = New-Object System.Drawing.Bitmap($img)
    $w = $bmp.Width
    $h = $bmp.Height
    $colors = New-Object 'System.Collections.Generic.HashSet[string]'
    $brightness = 0.0
    $samples = 0
    $stepX = [Math]::Max(1, [int]($w / 14))
    $stepY = [Math]::Max(1, [int]($h / 14))
    for ($x = 0; $x -lt $w; $x += $stepX) {
      for ($y = 0; $y -lt $h; $y += $stepY) {
        $c = $bmp.GetPixel($x, $y)
        [void]$colors.Add("$($c.R),$($c.G),$($c.B)")
        $brightness += ($c.R + $c.G + $c.B) / 3
        $samples += 1
      }
    }
    $avg = $brightness / [Math]::Max(1, $samples)
    $result += [pscustomobject]@{
      src = [string]$item.src
      path = [string]$file.FullName
      width = [int]$w
      height = [int]$h
      colors = [int]$colors.Count
      avg = [Math]::Round($avg, 2)
      size = [int64]$file.Length
      error = ''
    }
  } catch {
    $result += [pscustomobject]@{
      src = [string]$item.src
      path = [string]$item.path
      width = 0
      height = 0
      colors = 0
      avg = 0
      size = 0
      error = $_.Exception.Message
    }
  } finally {
    if ($bmp) { $bmp.Dispose() }
    if ($img) { $img.Dispose() }
  }
}
$result | ConvertTo-Json -Compress
`;

  try {
    const result = spawnSync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script, tempPath],
      { cwd: rootDir, encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 },
    );

    if (result.status !== 0 || !result.stdout.trim()) {
      return fallbackImageQuality(rootDir, unique);
    }

    const parsed = JSON.parse(result.stdout);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return new Map(rows.map((row) => [row.src, row]));
  } catch {
    return fallbackImageQuality(rootDir, unique);
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
}

export function isUsableLocalImage(quality) {
  if (!quality || quality.error) return false;
  if (quality.width < 640 || quality.height < 360) return false;
  if (quality.size < 30000) return false;
  if (quality.colors < 8) return false;
  if (quality.avg >= 253.5 || quality.avg <= 3) return false;
  if ((quality.avg >= 250.5 || quality.avg <= 8) && quality.colors < 18) return false;
  return true;
}
