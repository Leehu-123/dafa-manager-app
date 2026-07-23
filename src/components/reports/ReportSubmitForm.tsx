"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { Save, Send } from "lucide-react";

export function ReportSubmitForm({ currentUser }: { currentUser: any }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      // Fetch templates based on user department
      const res = await fetch("/api/reports/templates");
      if (res.ok) {
        setTemplates(await res.json());
      }
    };
    fetchTemplates();
  }, []);

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key: string, option: string, checked: boolean) => {
    const currentValues = formData[key] || [];
    if (checked) {
      setFormData(prev => ({ ...prev, [key]: [...currentValues, option] }));
    } else {
      setFormData(prev => ({ ...prev, [key]: currentValues.filter((v: string) => v !== option) }));
    }
  };

  const handleSubmit = async (status: string) => {
    if (!selectedTemplate || !reportDate) return alert("Vui lòng chọn mẫu báo cáo và ngày báo cáo");
    
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          reportDate,
          data: formData,
          status
        })
      });
      
      if (res.ok) {
        alert("Báo cáo đã được lưu thành công!");
        router.push("/reports");
      }
    } catch (error) {
      console.error("Error submitting report", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dafa-text">Mẫu báo cáo</label>
            <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
              <option value="">-- Chọn mẫu báo cáo --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.frequency === 'DAILY' ? 'Hàng ngày' : t.frequency === 'WEEKLY' ? 'Hàng tuần' : 'Hàng tháng'})</option>
              ))}
            </select>
          </div>
          <Input label="Ngày báo cáo" type="date" required value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
        </div>

        {currentTemplate && (
          <div className="mt-4 border-t dafa-border pt-4 flex flex-col gap-4">
            <h3 className="font-bold dafa-text mb-2">Nội dung báo cáo</h3>
            
            {(currentTemplate.fieldsConfig as any[]).map((field, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <label className="text-sm font-medium dafa-text">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <Input 
                    type="text" 
                    value={formData[field.key] || ''} 
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.type === 'number' && (
                  <Input 
                    type="number" 
                    value={formData[field.key] || ''} 
                    onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
                    required={field.required}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea 
                    className="border dafa-border rounded-md px-3 py-2 text-sm min-h-[100px]"
                    value={formData[field.key] || ''} 
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.type === 'checklist' && (
                  <div className="flex flex-col gap-2 p-3 border dafa-border rounded-md bg-gray-50">
                    {field.options?.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(formData[field.key] || []).includes(opt)}
                          onChange={(e) => handleCheckboxChange(field.key, opt, e.target.checked)}
                          className="rounded text-[#A14F39] focus:ring-[#A14F39]"
                        />
                        <span className="text-sm dafa-text">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 border-t dafa-border pt-4">
          <Button variant="outline" disabled={loading} onClick={() => handleSubmit("DRAFT")}>
            <Save className="w-4 h-4 mr-2" /> Lưu Nháp
          </Button>
          <Button className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white" disabled={loading} onClick={() => handleSubmit("SUBMITTED")}>
            <Send className="w-4 h-4 mr-2" /> Gửi Báo Cáo
          </Button>
        </div>
      </div>
    </Card>
  );
}
