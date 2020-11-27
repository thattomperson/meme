

import Jimp from 'jimp/es'
import { Gif, GifCodec, GifUtil, GifFrame } from 'gifwrap'
import { Font } from '@jimp/plugin-print'
import { NowRequest, NowResponse } from '@vercel/node'
import { join, resolve } from 'path'

class AsyncMemeGen {
  ops: any[]
  codec: GifCodec
  filePromise: Promise<Gif>
  font: Font

  constructor(filename: string) {
    this.ops = []
    this.filePromise = GifUtil.read(filename)
  }

  bottomText(text: string, from?: number, to?: number): this {
    this.ops.push({ op: 'bottomText', text, from, to })
    return this
  }

  private opBottomText(frames: GifFrame[], text: string, from?: number, to?: number): GifFrame[] {
    if (!from) from = 0;
    if (!to) to = frames.length
    
    return frames.map((frame, index) => {
      if (index >= from && index <= to) {
        const jimp: Jimp = GifUtil.copyAsJimp(Jimp, frame) as Jimp

        
        const width = Jimp.measureText(this.font, text)    
        jimp.print(
          this.font, 
          (jimp.bitmap.width - width) / 2, jimp.bitmap.height - this.font.info.size,
          text,
          jimp.bitmap.width,
          jimp.bitmap.height,
        )
        
        frame.bitmap = jimp.bitmap
      }
      return frame;
    })

  }

  async toBuffer(): Promise<Buffer> {
    const codec = new GifCodec()
    const file = await this.filePromise

    this.font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)

    let frames = file.frames

    this.ops.forEach(op => {
      switch (op.op) {
        case 'bottomText':
          frames = this.opBottomText(frames, op.text, op.from, op.to)
          break;
      }
    })

    GifUtil.quantizeDekker(frames, 256)

    const gif = await codec.encodeGif(file.frames, file)

    return gif.buffer
  }
}

export function load(name: string): AsyncMemeGen {
  return new AsyncMemeGen(resolve(join('./gifs', name)))
}

export default async (req: NowRequest, res: NowResponse) => {
  const memes = {
    grievous: () => import('./grievous')
  };

  const name = req.url.slice(1, req.url.indexOf('?'))
  if (memes[name]) {
    const buffer = await (await memes[name]()).default(req.query).toBuffer()
    res.setHeader('content-type', 'image/gif')
    res.send(buffer)
    res.end();
  } else {
    res.send(`No meme named ${name}`)
    res.end()
  }
}