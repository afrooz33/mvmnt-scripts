import { Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    return value
  }
}
