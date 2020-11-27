import { NowRequest, NowResponse } from '@vercel/node'
export default async (req: NowRequest, res: NowResponse) => {
  const memes = {
    grievous: () => import('../src/grievous')
  };

  const meme_name = req.query.meme_name as string;

  if (memes[meme_name]) {
    const buffer = await (await memes[meme_name]()).default(req.query).toBuffer()
    res.setHeader('content-type', 'image/gif')
    res.send(buffer)
    res.end();
  } else {
    res.send(`No meme named ${meme_name}`)
    res.end()
  }
}