"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Trash2, X, GripVertical } from "lucide-react";

export function ReportTemplateManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "", name: "", description: "", frequency: "DAILY", departmentId: "", fieldsConfig: [] as any[], isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tempRes, deptRes] = await Promise.all([
        fetch("/api/reports/templates"),
        fetch("/api/departments")
      ]);
      if (tempRes.ok) setTemplates(await tempRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addField = () => {
    const newField = { key: `field_${Date.now()}`, label: "Trường mới", type: "text", required: false, options: [] };
    setFormData({ ...formData, fieldsConfig: [...formData.fieldsConfig, newField] });
  };

  const removeField = (index: number) => {
    const newFields = [...formData.fieldsConfig];
    newFields.splice(index, 1);
    setFormData({ ...formData, fieldsConfig: newFields });
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...formData.fieldsConfig];
    newFields[index] = { ...newFields[index], [key]: value };
    setFormData({ ...formData, fieldsConfig: newFields });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.departmentId || formData.fieldsConfig.length === 0) {
      return alert("Vui lòng điền đủ thông tin và thêm ít nhất 1 trường dữ liệu");
    }

    try {
      const url = "/api/reports/templates" + (formData.id ? `/${formData.id}` : "");
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving template", error);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({ id: "", name: "", description: "", frequency: "DAILY", departmentId: "", fieldsConfig: [], isActive: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => openModal()} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
          <Plus className="w-4 h-4 mr-2" /> Tạo mẫu báo cáo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <Card key={t.id} className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold dafa-text text-lg">{t.name}</h3>
                <p className="text-sm dafa-muted">{t.department?.name}</p>
              </div>
              <Badge variant={t.isActive ? "default" : "secondary"}>
                {t.isActive ? "Hoạt động" : "Tạm khóa"}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{t.frequency === 'DAILY' ? 'Hàng ngày' : t.frequency === 'WEEKLY' ? 'Hàng tuần' : 'Hàng tháng'}</Badge>
              <Badge variant="outline">{t.fieldsConfig.length} trường dữ liệu</Badge>
            </div>
            
            <div className="mt-auto pt-4 border-t dafa-border flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => openModal(t)}>
                <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Sửa mẫu báo cáo" : "Tạo mẫu báo cáo mới"} className="max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tên mẫu báo cáo" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Phòng ban áp dụng</label>
              <select required className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})}>
                <option value="">Chọn phòng ban</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Input label="Mô tả" className="col-span-2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Tần suất</label>
              <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}>
                <option value="DAILY">Hàng ngày</option>
                <option value="WEEKLY">Hàng tuần</option>
                <option value="MONTHLY">Hàng tháng</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="rounded text-[#A14F39]" />
                <span className="text-sm font-medium dafa-text">Kích hoạt biểu mẫu</span>
              </label>
            </div>
          </div>

          <div className="border-t dafa-border pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold dafa-text">Cấu hình trường dữ liệu</h4>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="w-4 h-4 mr-2" /> Thêm trường
              </Button>
            </div>
            
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
              {formData.fieldsConfig.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 dafa-muted border border-dashed rounded-md">
                  Chưa có trường dữ liệu nào. Vui lòng thêm trường mới.
                </div>
              ) : (
                formData.fieldsConfig.map((field, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border dafa-border rounded-md relative group">
                    <GripVertical className="w-5 h-5 dafa-muted mt-2 cursor-grab" />
                    
                    <div className="flex-1 grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <Input label="Tên trường (Label)" required value={field.label} onChange={(e) => updateField(index, 'label', e.target.value)} />
                      </div>
                      <div className="col-span-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium dafa-text">Loại dữ liệu</label>
                          <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={field.type} onChange={(e) => updateField(index, 'type', e.target.value)}>
                            <option value="text">Văn bản ngắn (Text)</option>
                            <option value="textarea">Văn bản dài (Textarea)</option>
                            <option value="number">Số (Number)</option>
                            <option value="checklist">Danh sách chọn (Checklist)</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center justify-between pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} className="rounded text-[#A14F39]" />
                          <span className="text-sm dafa-text">Bắt buộc</span>
                        </label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeField(index)} className="text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {field.type === 'checklist' && (
                        <div className="col-span-12 mt-2">
                          <Input 
                            label="Các tùy chọn (cách nhau bởi dấu phẩy)" 
                            value={field.options?.join(', ') || ''} 
                            onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                            placeholder="Ví dụ: Tùy chọn 1, Tùy chọn 2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-[#A14F39] text-white hover:bg-[#8a3f2d]">Lưu mẫu báo cáo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
