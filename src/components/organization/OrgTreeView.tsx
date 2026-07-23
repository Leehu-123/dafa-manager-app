"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Building2, Users, MapPin, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function OrgTreeView() {
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, deptRes] = await Promise.all([
          fetch("/api/organization/branches"),
          fetch("/api/organization/departments")
        ]);
        if (branchRes.ok) {
          const data = await branchRes.json();
          setBranches(data);
          const initialExpanded: Record<string, boolean> = {};
          data.forEach((b: any) => initialExpanded[b.id] = true);
          setExpandedBranches(initialExpanded);
        }
        if (deptRes.ok) setDepartments(await deptRes.json());
      } catch (error) {
        console.error("Error fetching org data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleBranch = (id: string) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="p-8 text-center dafa-muted">Đang tải cấu trúc tổ chức...</div>;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-md border dafa-border">
          <Building2 className="w-6 h-6 text-[#A14F39]" />
          <div>
            <h2 className="font-bold text-lg dafa-text">DAFA Glass</h2>
            <p className="text-xs dafa-muted">Công ty Cổ phần Kính DAFA</p>
          </div>
        </div>

        <div className="pl-6 border-l-2 border-gray-200 ml-6 flex flex-col gap-4 mt-4">
          {branches.map(branch => {
            const branchDepts = departments.filter(d => d.branchId === branch.id);
            const isExpanded = expandedBranches[branch.id];

            return (
              <div key={branch.id} className="flex flex-col gap-2">
                <div 
                  className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 border dafa-border rounded-md cursor-pointer transition-colors"
                  onClick={() => toggleBranch(branch.id)}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 dafa-muted" /> : <ChevronRight className="w-4 h-4 dafa-muted" />}
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold dafa-text flex items-center gap-2">
                      {branch.name}
                      {!branch.isActive && <Badge variant="secondary" className="text-xs">Tạm ngừng</Badge>}
                    </h3>
                    <p className="text-xs dafa-muted">{branch.city} - {branch.region}</p>
                  </div>
                  <Badge variant="outline">{branchDepts.length} phòng ban</Badge>
                </div>

                {isExpanded && (
                  <div className="pl-6 border-l-2 border-gray-200 ml-4 flex flex-col gap-2 mt-1">
                    {branchDepts.length === 0 ? (
                      <div className="text-sm dafa-muted italic p-2">Chưa có phòng ban</div>
                    ) : (
                      branchDepts.map(dept => (
                        <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-md">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-green-600" />
                            <div>
                              <h4 className="font-medium text-sm dafa-text">{dept.name}</h4>
                              <p className="text-xs dafa-muted">{dept.code}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white">Quản lý nội bộ</Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
