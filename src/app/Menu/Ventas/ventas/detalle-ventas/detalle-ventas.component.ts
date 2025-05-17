// Ajustes del template de DetalleVentasComponent
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-ventas.component.html',
  styleUrls: ['./detalle-ventas.component.scss'],
  standalone: false
})
export class DetalleVentasComponent implements OnInit {
  @Input() subtotal: number = 0;
  @Input() total: number = 0;
  @Output() onCancelar = new EventEmitter<void>();
  @Output() onConfirmar = new EventEmitter<any>();
  @Output() cerrarDetalle = new EventEmitter<void>();


  detalleForm: FormGroup;
  cambio: number = 0;

  constructor(private fb: FormBuilder) {
    this.detalleForm = this.fb.group({
      montoRecibido: [null, [Validators.required, Validators.min(0)]],
      cambio: [{ value: 0, disabled: true }],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    // Inicializamos los campos con los valores de entrada
    this.detalleForm.patchValue({
      subtotal: this.subtotal,
      total: this.total
    });
    
    this.detalleForm.get('montoRecibido')?.valueChanges.subscribe(valor => {
      if (valor != null) {
        this.cambio = valor - this.total;
        this.detalleForm.get('cambio')?.setValue(this.cambio);
      }
    });
  }

  ngOnChanges(): void {
    // Actualizamos los valores cuando cambian los @Input
    if (this.detalleForm) {
      this.detalleForm.patchValue({
        subtotal: this.subtotal,
        total: this.total
      });
    }
  }

  cancelar(): void {
    this.onCancelar.emit();
  }

  confirmar(): void {
    const montoRecibido = this.detalleForm.get('montoRecibido')?.value;

    if (this.detalleForm.invalid || montoRecibido < this.total) {
      alert('El monto recibido debe ser igual o mayor al total de la venta');
      return;
    }

    this.onConfirmar.emit({
      subtotal: this.subtotal,
      total: this.total,
      montoRecibido,
      cambio: this.cambio,
      observaciones: this.detalleForm.get('observaciones')?.value
    });
  }
    cerrar(): void {
    this.cerrarDetalle.emit();
  }
}