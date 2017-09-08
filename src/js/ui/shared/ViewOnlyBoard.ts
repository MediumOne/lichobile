import * as h from 'mithril/hyperscript'
import Chessground from '../../chessground/Chessground'
import { uciToMove } from '../../utils/chessFormat'
import settings from '../../settings'

interface Bounds {
  width: number
  height: number
}

export interface Attrs {
  fen: string
  orientation: Color
  lastMove?: string
  bounds?: Bounds
  customPieceTheme?: string
  variant?: VariantKey
}

interface Config {
  fen: string
  orientation: Color
  viewOnly: boolean
  minimalDom: boolean
  coordinates: boolean
  lastMove?: [Key, Key]
  bounds?: Bounds
}

interface State {
  ground: Chessground
  pieceTheme: string
  boardTheme: string
}

const ViewOnlyBoard: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    this.pieceTheme = settings.general.theme.piece()
    this.boardTheme = settings.general.theme.board()
    this.ground = new Chessground(makeConfig(attrs))
  },

  oncreate({ dom }) {
    this.ground.attach(dom as HTMLElement)
  },

  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    if (
      attrs.fen !== oldattrs.fen ||
      attrs.lastMove !== oldattrs.lastMove ||
      attrs.orientation !== oldattrs.orientation || (!oldattrs.bounds || attrs.bounds && (
      attrs.bounds.height !== oldattrs.bounds.height ||
      attrs.bounds.width !== oldattrs.bounds.width))
    ) {
      return true
    }
    else return false
  },

  onupdate({ attrs }) {
    const conf = {
      ...attrs,
      lastMove: attrs.lastMove ? uciToMove(attrs.lastMove) : undefined
    }
    // view only board care only about width and height
    if (attrs.bounds) this.ground.setBounds(attrs.bounds as ClientRect)
    this.ground.set(conf)
  },

  onremove() {
    this.ground.unload()
  },

  view({ attrs }) {

    const boardClass = [
      'display_board',
      attrs.customPieceTheme || this.pieceTheme,
      this.boardTheme,
      attrs.variant || 'standard'
    ].join(' ')

    return h('div', { className: boardClass })
  }
}

export default ViewOnlyBoard

function makeConfig({ fen, lastMove, orientation, bounds }: Attrs) {
  const conf: Config = {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen,
    lastMove: lastMove ? uciToMove(lastMove) : undefined,
    orientation: orientation || 'white',
    bounds
  }

  return conf
}
