import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'prixMad', standalone: true })
export class PrixMadPipe implements PipeTransform {
  /**
   * Affiche un montant en DH (devise marocaine).
   * - null / undefined / NaN → "—" (donnée manquante)
   * - 0 → "0 DH" (valeur valide, ex: revenu)
   * - n > 0 → "N DH" formaté fr-MA
   */
  transform(value: number | string | null | undefined): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (n == null || isNaN(n as number)) return '—';
    return `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(n as number)} DH`;
  }
}
