import { load } from '.'

export default function (params: { name?: string }) {
  return load('grievous.gif')
    .bottomText(params.name ? params.name :  'General Kenobi', 2)
}