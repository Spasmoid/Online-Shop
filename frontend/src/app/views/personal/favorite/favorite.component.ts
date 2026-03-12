import { Component, OnInit } from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  cart: CartType | null = null;
  serverStaticPath = environment.serverStaticPath;
  constructor(private favoriteService: FavoriteService, private cartService: CartService) { }

  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe((data: FavoriteType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        const error = (data as DefaultResponseType).message;
        throw new Error(error);
      }

      this.products = data as FavoriteType[];

      this.cartService.getCart().subscribe((cartData: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.cart = (cartData as CartType);

        if (this.cart) {
          const cart = this.cart;
          this.products.forEach((favoriteProduct: FavoriteType) => {
            const productInCart = cart.items.find(item => favoriteProduct.id === item.product.id);
            if (productInCart) {
              favoriteProduct.countInCart = productInCart.quantity;
            }
          });
        }
      });
    });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id).subscribe((data: DefaultResponseType) => {
      if (data.error) {
        throw new Error(data.message);
      }

      this.products = this.products.filter(item => item.id !== id);
    });
  }

  updateCount(product: FavoriteType, count: number) {
    this.cartService.updateCart(product.id, count).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }

      const productInCart = (data as CartType).items.find(item => item.product.id === product.id);
      if (productInCart) {
        product.countInCart = productInCart.quantity;
      }
    });
  }

  addToCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, 1).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }

      product.countInCart = 1;
    });
  }

  removeFromCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, 0).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }

      product.countInCart = 0;
    });
  }
}
