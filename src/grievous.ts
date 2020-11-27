import { load } from '.'

export default function (params: { name: string } = { name: 'General Kenobi'}) {
  return load('grievous.gif')
    .bottomText(params.name ?? 'General Kenobi', 2)
}