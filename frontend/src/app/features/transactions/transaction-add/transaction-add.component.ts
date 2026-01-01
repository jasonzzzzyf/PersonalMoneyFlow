// transaction-add.component.ts - 添加交易组件（修复版）
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService, Transaction } from '../../../shared/services/transaction.service';
import { CategoryService, Category } from '../../../shared/services/category.service';

@Component({
  selector: 'app-transaction-add',
  templateUrl: './transaction-add.component.html',
  styleUrls: ['./transaction-add.component.scss']
})
export class TransactionAddComponent implements OnInit {
  transactionForm!: FormGroup;
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  isSubmitting = false;
  errorMessage = '';
  selectedType: 'INCOME' | 'EXPENSE' = 'EXPENSE';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    
    // 从路由参数获取默认日期（如果有）
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.transactionForm.patchValue({ transactionDate: params['date'] });
      }
      if (params['type']) {
        this.selectedType = params['type'];
        this.transactionForm.patchValue({ transactionType: params['type'] });
        this.filterCategories();
      }
    });
  }

  /**
   * 初始化表单
   */
  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.transactionForm = this.fb.group({
      transactionType: [this.selectedType, Validators.required],
      categoryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      transactionDate: [today, Validators.required],
      description: [''],
      notes: [''],
      tags: [''],
      isRecurring: [false],
      recurringFrequency: ['']
    });

    // 监听交易类型变化
    this.transactionForm.get('transactionType')?.valueChanges.subscribe(type => {
      this.selectedType = type;
      this.filterCategories();
      this.transactionForm.patchValue({ categoryId: '' });
    });
  }

  /**
   * 加载分类
   */
  loadCategories(): void {
    console.log('开始加载分类...');
    
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('分类加载成功:', categories);
        this.categories = categories;
        this.filterCategories();
        
        // 如果没有分类，显示提示
        if (this.categories.length === 0) {
          this.errorMessage = '暂无分类，请先联系管理员添加分类';
        }
      },
      error: (error) => {
        console.error('加载分类失败:', error);
        this.errorMessage = '无法加载分类列表，请检查网络连接或后端服务';
      }
    });
  }

  /**
   * 根据交易类型筛选分类
   */
  filterCategories(): void {
    this.filteredCategories = this.categories.filter(
      cat => cat.categoryType === this.selectedType
    );
    console.log(`筛选后的${this.selectedType}分类:`, this.filteredCategories);
  }

  /**
   * 切换交易类型
   */
  switchType(type: 'INCOME' | 'EXPENSE'): void {
    this.selectedType = type;
    this.transactionForm.patchValue({ 
      transactionType: type,
      categoryId: ''
    });
  }

  /**
   * 提交表单
   */
  onSubmit(): void {
    console.log('开始提交表单...');
    console.log('表单值:', this.transactionForm.value);
    console.log('表单有效性:', this.transactionForm.valid);

    if (this.transactionForm.invalid) {
      console.log('表单验证失败');
      this.markFormGroupTouched(this.transactionForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.transactionForm.value;
    const transaction: Transaction = {
      transactionType: formValue.transactionType,
      categoryId: parseInt(formValue.categoryId),
      amount: parseFloat(formValue.amount),
      transactionDate: formValue.transactionDate,
      description: formValue.description || undefined,
      notes: formValue.notes || undefined,
      tags: formValue.tags || undefined,
      isRecurring: formValue.isRecurring || false,
      recurringFrequency: formValue.isRecurring ? formValue.recurringFrequency : undefined
    };

    console.log('准备发送的交易数据:', transaction);

    this.transactionService.createTransaction(transaction).subscribe({
      next: (response) => {
        console.log('交易创建成功:', response);
        this.successMessage = '交易添加成功！';
        
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          this.router.navigate(['/transactions'], { 
            queryParams: { refresh: 'true' } 
          });
        }, 1000);
      },
      error: (error) => {
        console.error('创建交易失败:', error);
        this.errorMessage = error.message || '创建交易失败，请重试';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * 取消操作
   */
  onCancel(): void {
    this.router.navigate(['/transactions']);
  }

  /**
   * 标记所有字段为已触摸（显示验证错误）
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * 获取分类名称
   */
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.categoryName : '';
  }

  /**
   * 检查字段是否有错误且已触摸
   */
  hasError(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * 获取字段错误信息
   */
  getErrorMessage(fieldName: string): string {
    const field = this.transactionForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['min']) {
      return 'Amount must be greater than 0';
    }
    return '';
  }
}
