import {
  useGetAllLabUserQuery,
  useGetAllPatientQuery,
} from "@/services/userApi";
import { useAuth } from "@/hooks/useAuth";

export function useChatPeers(searchTerm?: string) {
  const { user } = useAuth();
  const roleCode = user?.data?.roleCode;
  const isPatient = roleCode === "patient";
  const isDoctor =
    roleCode === "doctor" ||
    roleCode === "consultant" ||
    roleCode === "lab_user";

  const params = { search: searchTerm || undefined, status: 1, limit: 100 };
  const { data: labUsers, isLoading: isLoadingLab } = useGetAllLabUserQuery(
    params,
    { skip: !isPatient } as any
  );
  const { data: patients, isLoading: isLoadingPat } = useGetAllPatientQuery(
    params,
    { skip: !isDoctor } as any
  );

  return {
    users: isPatient ? labUsers?.data?.user : patients?.data?.user,
    isLoading: isPatient ? isLoadingLab : isLoadingPat,
    targetLabel: isPatient ? "doctor" : "patient",
    isPatient,
    isDoctor,
  };
}
