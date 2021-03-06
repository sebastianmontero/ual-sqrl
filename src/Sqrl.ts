import {
  ButtonStyle,
} from 'universal-authenticator-library'
import { sqrlLogo } from './sqrlLogo'
import { Name } from './interfaces'
import { Scatter } from '@smontero/ual-scatter'

export class Sqrl extends Scatter {

  public getStyle(): ButtonStyle {
    return {
      icon: sqrlLogo,
      text: Name,
      textColor: 'white',
      background: '#625c52'
    }
  }

  public getOnboardingLink(): string {
    return 'https://sqrlwallet.io/'
  }
}
