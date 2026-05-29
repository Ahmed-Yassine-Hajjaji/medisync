import { Pipe, PipeTransform } from '@angular/core';

const JOUR_MAP: Record<string, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche'
};

@Pipe({ name: 'jourSemaine', standalone: true })
export class JourSemainePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return JOUR_MAP[value.toUpperCase()] ?? value;
  }
}
