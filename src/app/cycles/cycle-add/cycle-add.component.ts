import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CycleService } from '../../services/cycle.service';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-cycle-add',
  templateUrl: './cycle-add.component.html',
  styleUrls: ['./cycle-add.component.scss']
})
export class CycleAddComponent implements OnInit {
  cycleForm = this.fb.group({
    brand: ['', [Validators.required, Validators.maxLength(50)]],
    type: ['', [Validators.required, Validators.maxLength(50)]],
    model: ['', [Validators.required, Validators.maxLength(50)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['']
  });

  isEditMode = false;
  cycleId: number | null = null;
  loading = false;
  userRole: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cycleService: CycleService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.userRole = this.authService.getUserRole();
      if (id) {
        this.isEditMode = true;
        this.cycleId = +id;
        this.loadCycle(this.cycleId);
       
      }
    });
  }

  loadCycle(id: number): void {
    this.loading = true;
    this.cycleService.getCycleById(id).subscribe({
      next: (cycle) => {
        this.cycleForm.patchValue({
          brand: cycle.brand,
          type: cycle.type,
          model: cycle.model,
          price: cycle.price,
          stockQuantity: cycle.stockQuantity,
          imageUrl: cycle.imageUrl || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cycle data'
        });
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.cycleForm.patchValue({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.cycleForm.invalid || this.loading) return;
    console.log('userRole before submit:', this.userRole);


    this.loading = true;
    const formValue = this.cycleForm.value;

    const cycleData = {
      brand: formValue.brand!,
      type: formValue.type!,
      model: formValue.model!,
      price: formValue.price!,
      stockQuantity: formValue.stockQuantity!,
      imageUrl: formValue.imageUrl || undefined
    };

    const operation = this.isEditMode && this.cycleId
      ? this.cycleService.updateCycle(this.cycleId, cycleData)
      : this.cycleService.addCycle(cycleData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Cycle ${this.isEditMode ? 'updated' : 'added'} successfully`
        });
      

        this.loading = false;
        
        if (this.userRole === 'Admin') {
          console.log('role',this.userRole);
          
          this.router.navigate(['/admin/inventory']);
        } else if (this.userRole === 'Employee') {
          this.router.navigate(['/employee/inventory']);
        }

      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Operation failed'
        });
        this.loading = false;
      }
    });
  }
}