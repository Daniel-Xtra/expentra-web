import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { EditDepartmentDialog } from '@/features/departments/components/DepartmentFormDialogs';
import { DepartmentProfileView } from '@/features/departments/components/DepartmentProfileView';
import {
  departmentFormSchema,
  NO_MANAGER_VALUE,
  toUpdateDepartmentPayload,
  type DepartmentFormValues,
} from '@/features/departments/department-form';
import { AppConfirmModal } from '@/shared/reusable/AppConfirmModal';
import { invalidateDepartments, queryKeys } from '@/shared/api/query-keys';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { deleteDepartment, getDepartment, updateDepartment } from '../api';

export function DepartmentDetailPage() {
  const { reference = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const departmentQuery = useQuery({
    queryKey: queryKeys.departments.detail(reference),
    queryFn: () => getDepartment(reference),
    enabled: Boolean(reference),
  });

  const editForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { name: '', code: '', managerReference: NO_MANAGER_VALUE },
  });

  const updateMutation = useMutation({
    mutationFn: (values: DepartmentFormValues) =>
      updateDepartment(reference, toUpdateDepartmentPayload(values)),
    onSuccess: async () => {
      toastSuccess('Department updated');
      setShowEdit(false);
      await invalidateDepartments(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to update department'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) => updateDepartment(reference, { isActive }),
    onSuccess: async () => {
      toastSuccess('Department updated');
      await invalidateDepartments(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to update department'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDepartment(reference),
    onSuccess: async () => {
      toastSuccess('Department deleted');
      await invalidateDepartments(queryClient);
      navigate('/admin/departments');
    },
    onError: (err) => toastError(err, 'Failed to delete department'),
  });

  const openEdit = () => {
    if (!departmentQuery.data) return;
    editForm.reset({
      name: departmentQuery.data.name,
      code: departmentQuery.data.code,
      managerReference:
        departmentQuery.data.manager?.reference ?? NO_MANAGER_VALUE,
    });
    setShowEdit(true);
  };

  const department = departmentQuery.data;

  return (
    <>
      <DepartmentProfileView
        reference={reference}
        backTo="/admin/departments"
        backLabel="Departments"
        onEdit={openEdit}
        onToggleActive={() => {
          if (!department) return;
          void toggleActiveMutation.mutateAsync(!department.isActive);
        }}
        onDelete={() => setShowDelete(true)}
        togglePending={toggleActiveMutation.isPending}
      />

      {department ? (
        <>
          <EditDepartmentDialog
            department={department}
            open={showEdit}
            onOpenChange={setShowEdit}
            form={editForm}
            loading={updateMutation.isPending}
            onSubmit={editForm.handleSubmit((values) => updateMutation.mutateAsync(values))}
          />

          <AppConfirmModal
            open={showDelete}
            onOpenChange={setShowDelete}
            title="Delete department"
            description={`Delete ${department.name}? This action cannot be undone.`}
            confirmLabel="Delete"
            destructive
            loading={deleteMutation.isPending}
            onConfirm={async () => {
              await deleteMutation.mutateAsync();
              setShowDelete(false);
            }}
          />
        </>
      ) : null}
    </>
  );
}
