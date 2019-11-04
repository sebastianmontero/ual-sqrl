import ScatterJS from 'scatterjs-core'
import ScatterEOS from 'scatterjs-plugin-eosjs2'
import {
  Authenticator, ButtonStyle, Chain,
  UALError, UALErrorType, User
} from 'universal-authenticator-library'
import { Name } from './interfaces'
import { scatterLogo } from './scatterLogo'
import { ScatterUser } from './ScatterUser'
import { UALScatterError } from './UALScatterError'
import { Scatter } from './Scatter'

declare var window: any

import { sqrlLogo } from './sqrlLogo'

export class Sqrl extends Scatter {

  public getStyle(): ButtonStyle {
    return {
      icon: sqrlLogo,
      text: Name,
      textColor: 'white',
      background: '#625c52'
    }
  }
}
