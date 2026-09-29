import { AsyncPipe, NgClass, NgStyle, UpperCasePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Restoran } from '../../core/models/restoran.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Card } from '../../shared/components/card/card';
import { Rating } from '../../shared/components/rating/rating';

/**
 * Lista restorana.
 *
 * Podaci se dobijaju iz servisa kao Observable i u templateu se citaju
 * preko async pipe-a. async pipe se sam pretpljuje na Observable, racuna
 * promene i automatski odjavljuje kad se komponita unisti - zato nije
 * potrebno rucno pozivati subscribe().
 */
@Component({
  selector: 'app-restaurants',
  imports: [AsyncPipe, NgClass, NgStyle, RouterLink, UpperCasePipe, Card, Rating],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants implements OnInit {
  private readonly restaurantService = inject(RestaurantService);

  protected readonly restorani$: Observable<Restoran[]> = this.restaurantService.filteredRestaurants$;

  protected readonly poceo = signal(false);

  /**
   * Backend NE vraca ocenu restorana (model `Restoran` nema to polje), pa su
   * ovde hardkodovane demo vrednosti da bi se komponenta `app-rating`
   * (input + output iz PDF-a) mogla prikazati. Nisu povezane sa serverom.
   */
  protected readonly ocene = signal<Record<number, number>>({ 1: 4, 2: 5, 3: 3 });

  ngOnInit(): void {
    // Pokretanje pretrage sa praznim izrazom prikazuje celu listu.
    this.restaurantService.search('');
  }

  protected onSearch(term: string): void {
    this.poceo.set(true);
    this.restaurantService.search(term);
  }

  protected ocena(id: number | undefined): number {
    return id === undefined ? 0 : (this.ocene()[id] ?? 0);
  }
}
