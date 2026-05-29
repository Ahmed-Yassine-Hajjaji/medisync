import { Pipe, PipeTransform } from '@angular/core';

/**
 * Traduit les valeurs enum Specialite (renvoyées par le backend en MAJUSCULES sans accents)
 * vers un libellé français propre et accentué pour l'affichage UI.
 */
const SPECIALITE_LABELS: Record<string, string> = {
  GENERALISTE:      'Généraliste',
  CARDIOLOGUE:      'Cardiologue',
  DERMATOLOGUE:     'Dermatologue',
  PEDIATRE:         'Pédiatre',
  GYNECOLOGUE:      'Gynécologue',
  OPHTALMOLOGUE:    'Ophtalmologue',
  ORL:              'ORL',
  NEUROLOGUE:       'Neurologue',
  PSYCHIATRE:       'Psychiatre',
  RADIOLOGUE:       'Radiologue',
  CHIRURGIEN:       'Chirurgien',
  DENTISTE:         'Dentiste',
  KINESITHERAPEUTE: 'Kinésithérapeute',
  AUTRE:            'Autre',
};

@Pipe({ name: 'specialiteLabel', standalone: true })
export class SpecialiteLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return SPECIALITE_LABELS[value.toUpperCase()] ?? value;
  }
}
