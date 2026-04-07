import { DepartmentImportDto } from '../dto/department-import-dto';
// job.transformer.ts
export class DepartmentTransformer {
  static toDto(row: any): DepartmentImportDto {
    return {
      name: String(row.name ?? '').trim(),
      description: String(row.description ?? '').trim(),
      isActive: this.parseBoolean(row.isActive),
    };
  }

  private static parseBoolean(value: any): boolean {
    if (value === null || value === undefined || String(value).trim() === '')
      return true;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    return ['true', '1', 'active', 'yes', 'co', 'on'].includes(normalized);
  }
}
