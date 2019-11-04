import {
  ButtonStyle,
} from 'universal-authenticator-library'
import { sqrlLogo } from './sqrlLogo'
import { Name } from './interfaces'
import { Scatter } from './Scatter'

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
    return 'https://github.com/Telos-Foundation/Sqrl'
  }
}
