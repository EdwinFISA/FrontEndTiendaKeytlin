import { Component, OnInit } from '@angular/core';
import { ProductosService, ProductoConStock } from  '../../../services/stock.service';

@Component({
  selector: 'app-stock',
  standalone: false,
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit {
productos: ProductoConStock[] = [];
  loading = true;

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.obtenerProductos();

} 

obtenerProductos(): void {
  this.loading = true;
  this.productosService.obtenerStockProductos().subscribe({
    next: (data) => {
      console.log('Respuesta completa del API:', data);
      this.productos = data;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error al obtener productos:', err);
      this.loading = false;
    }
  });
}
}