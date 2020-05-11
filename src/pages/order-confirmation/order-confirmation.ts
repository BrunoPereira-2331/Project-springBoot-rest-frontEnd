import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OrderDTO } from '../../models/order.dto';
import { CartItem } from '../../models/CartItem';
import { CartService } from '../../services/domain/cart.service';
import { ClientDTO } from '../../models/client.dto';
import { AddressDTO } from '../../models/address.dto';
import { ClientService } from '../../services/domain/client.service';
import { _ParseAST } from '@angular/compiler';
import { OrderService } from '../../services/domain/order.service';

@IonicPage()
@Component({
  selector: 'page-order-confirmation',
  templateUrl: 'order-confirmation.html',
})
export class OrderConfirmationPage {
  
  order: OrderDTO;
  cartItems: CartItem[];
  client: ClientDTO;
  address: AddressDTO;
  orderCode: string;
  
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public cartService: CartService,
    public clientService: ClientService,
    public orderService: OrderService) {
      this.order = this.navParams.get('order');
    }
    
    ionViewDidLoad() {
      this.cartItems = this.cartService.getCart().items;
      this.clientService.findById(this.order.client.id)
      .subscribe(response => {
        this.client = response as ClientDTO;
        this.address = this.findAddress(this.order.deliveryAdress.id, response['addresses']);
      },
      
      error => {
        this.navCtrl.setRoot('HomePage');
      });
    }
    
    private findAddress(id : string, list: AddressDTO[]) : AddressDTO {
      let position = list.findIndex(x => x.id == id);
      return list[position];
    }
    
    totalValueOrder() {
      return this.cartService.totalValueCart();
    }
    
    back() {
      this.navCtrl.setRoot('CartPage');
    }
    
    home() {
      this.navCtrl.setRoot('CategoriesPage');
    }
    
    checkout() {
      this.orderService.insert(this.order)
      .subscribe(response => {
        this.cartService.createOrClearCart();
        this.orderCode = this.extractId(response.headers.get('location'));
      },
      error => {
        if (error.status == 403) {
          this.navCtrl.setRoot('HomePage');
        }
      });
    }
    
    private extractId(location : string) : string {
      let position = location.lastIndexOf('/');
      console.log(position);
      return location.substring(position + 1, location.length);
    }
  }
  