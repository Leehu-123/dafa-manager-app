"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Building2, Users, MapPin, ChevronRight, ChevronDown, User, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ReorderableList } from "./ReorderableList";

export function OrgTreeView() {
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});
  const [isBldExpanded, setIsBldExpanded] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, deptRes, empRes] = await Promise.all([
          fetch("/api/organization/branches"),
          fetch("/api/departments"),
          fetch("/api/organization/employees")
        ]);
        if (branchRes.ok) {
          const data = await branchRes.json();
          // Sort by sortOrder
          data.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setBranches(data);
          const initialExpanded: Record<string, boolean> = {};
          data.forEach((b: any) => initialExpanded[b.id] = true);
          setExpandedBranches(initialExpanded);
        }
        if (deptRes.ok) {
          const data = await deptRes.json();
          data.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setDepartments(data);
        }
        if (empRes.ok) {
          const data = await empRes.json();
          data.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setEmployees(data);
        }
      } catch (error) {
        console.error("Error fetching org data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReorder = async (type: 'BRANCH' | 'DEPARTMENT' | 'USER', newItems: any[]) => {
    // 1. Update local state
    if (type === 'BRANCH') setBranches(newItems);
    else if (type === 'DEPARTMENT') {
      // Because we only reorder within a branch, newItems are just the depts of ONE branch.
      // We need to merge them back into the main departments array.
      const branchId = newItems[0]?.branchId;
      if (branchId) {
        setDepartments(prev => [
          ...prev.filter(d => d.branchId !== branchId),
          ...newItems
        ]);
      }
    } else if (type === 'USER') {
      // Same logic, newItems are a subset of users
      const subsetIds = new Set(newItems.map(i => i.id));
      setEmployees(prev => [
        ...prev.filter(e => !subsetIds.has(e.id)),
        ...newItems
      ]);
    }

    // 2. Prepare payload for API
    const itemsPayload = newItems.map((item, index) => ({
      id: item.id,
      sortOrder: index
    }));

    // 3. Call API
    try {
      await fetch("/api/organization/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, items: itemsPayload })
      });
    } catch (error) {
      console.error("Failed to save reorder", error);
    }
  };

  const toggleBranch = (id: string) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDept = (id: string) => {
    setExpandedDepts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="p-8 text-center dafa-muted">Đang tải cấu trúc tổ chức...</div>;

  const bldEmployees = employees.filter(emp => emp.role === "ADMIN");

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
          
          {/* Ban Lãnh Đạo */}
          <div className="flex flex-col gap-2">
            <div 
              className="flex items-center gap-3 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md cursor-pointer transition-colors"
              onClick={() => setIsBldExpanded(!isBldExpanded)}
            >
              {isBldExpanded ? <ChevronDown className="w-4 h-4 text-amber-700" /> : <ChevronRight className="w-4 h-4 text-amber-700" />}
              <Star className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">Ban Lãnh Đạo</h3>
              </div>
              <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">{bldEmployees.length} nhân sự</Badge>
            </div>
            
            {isBldExpanded && (
              <div className="pl-6 border-l-2 border-amber-200 ml-4 flex flex-col gap-2 mt-1">
                {bldEmployees.length === 0 ? (
                  <div className="text-sm dafa-muted italic p-2">Chưa có lãnh đạo nào</div>
                ) : (
                  <ReorderableList 
                    items={bldEmployees} 
                    onReorder={(newItems) => handleReorder('USER', newItems)}
                    renderItem={(emp) => (
                      <div className="flex w-full items-center gap-3 p-2 bg-white hover:bg-gray-50 border border-gray-100 rounded-md transition-colors">
                        <User className="w-4 h-4 text-amber-600" />
                        <div>
                          <h4 className="font-medium text-sm dafa-text">{emp.fullName || emp.name}</h4>
                          <p className="text-xs text-amber-600">{emp.jobTitle || "Quản trị viên"}</p>
                        </div>
                      </div>
                    )}
                  />
                )}
              </div>
            )}
          </div>

          <ReorderableList 
            items={branches}
            onReorder={(newItems) => handleReorder('BRANCH', newItems)}
            renderItem={(branch) => {
              const branchDepts = departments.filter(d => d.branchId === branch.id);
              const isExpanded = expandedBranches[branch.id];
              return (
                <div className="flex flex-col gap-2 w-full">
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
                      <p className="text-xs dafa-muted">{branch.city} - {branch.address}</p>
                    </div>
                    <Badge variant="outline">{branchDepts.length} phòng ban</Badge>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 border-l-2 border-gray-200 ml-4 flex flex-col gap-2 mt-1 mb-2">
                      {branchDepts.length === 0 ? (
                        <div className="text-sm dafa-muted italic p-2">Chưa có phòng ban</div>
                      ) : (
                        <ReorderableList 
                          items={branchDepts}
                          onReorder={(newItems) => handleReorder('DEPARTMENT', newItems)}
                          renderItem={(dept) => {
                            const isDeptExpanded = expandedDepts[dept.id];
                            const deptEmployees = employees.filter(emp => 
                              emp.departmentMember?.some((dm: any) => dm.departmentId === dept.id) ||
                              emp.departments?.some((dm: any) => dm.departmentId === dept.id)
                            );
                            return (
                              <div className="flex flex-col gap-1 w-full">
                                <div 
                                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md cursor-pointer"
                                  onClick={() => toggleDept(dept.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    {isDeptExpanded ? <ChevronDown className="w-4 h-4 dafa-muted" /> : <ChevronRight className="w-4 h-4 dafa-muted" />}
                                    <Users className="w-4 h-4 text-green-600" />
                                    <div>
                                      <h4 className="font-medium text-sm dafa-text">{dept.name}</h4>
                                      <p className="text-xs dafa-muted">{dept.code}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="bg-white">{deptEmployees.length} nhân sự</Badge>
                                </div>

                                {isDeptExpanded && (
                                  <div className="pl-8 flex flex-col gap-1 mt-1 mb-2">
                                    {deptEmployees.length === 0 ? (
                                      <div className="text-xs dafa-muted italic p-2">Phòng ban chưa có nhân sự</div>
                                    ) : (
                                      <ReorderableList 
                                        items={deptEmployees}
                                        onReorder={(newItems) => handleReorder('USER', newItems)}
                                        renderItem={(emp) => (
                                          <div className="flex items-center w-full gap-2 p-2 rounded-md bg-white border border-gray-50 hover:bg-gray-50">
                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm dafa-text">{emp.fullName || emp.name}</span>
                                            {emp.jobTitle && <span className="text-xs dafa-muted">- {emp.jobTitle}</span>}
                                            {emp.role === "MANAGER" && <Badge variant="secondary" className="ml-auto text-[10px]">Trưởng phòng</Badge>}
                                          </div>
                                        )}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>
    </Card>
  );
}
