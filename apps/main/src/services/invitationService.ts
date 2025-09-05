import axiosInstance from '../config/axios';

export interface InvitationDetails {
  id: string;
  type: 'workspace' | 'space';
  invitedBy: string | { _id: string; name: string; avatar?: string };
  targetEntity: { type: 'Workspace' | 'Space'; id: string; name: string };
  role: string;
  message?: string;
  expiresAt?: string;
  createdAt?: string;
}

export class InvitationService {
  static async getByToken(token: string): Promise<InvitationDetails> {
    const res = await axiosInstance.get(`/invitations/token/${token}`);
    return res.data?.data?.invitation;
  }

  static async accept(token: string): Promise<any> {
    const res = await axiosInstance.post(`/invitations/token/${token}/accept`);
    return res.data?.data;
  }

  static async decline(token: string): Promise<any> {
    const res = await axiosInstance.post(`/invitations/token/${token}/decline`);
    return res.data?.data;
  }
}
