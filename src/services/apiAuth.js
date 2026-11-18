import { api, lire } from './apiClient'
import { normaliserUtilisateur } from './authMappers'

export const apiAuth = {
  connexion: async (identifiant, password, codeTotp) => {
    const corps = { identifiant, password }
    if (codeTotp) corps.codeTotp = codeTotp
    const { data } = await api.post('/auth/login', corps)
    return data
  },

  verifier2fa: async (challengeToken, codeTotp) => {
    const { data } = await api.post('/auth/2fa/verifier', { challengeToken, codeTotp })
    return data
  },

  profil: async () => {
    const data = await lire('/auth/profil')
    return normaliserUtilisateur(data?.utilisateur || data?.user || data, data)
  },

  deconnexion: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  changerMotDePasse: (ancienPassword, nouveauPassword) =>
    api.post('/auth/mot-de-passe/changer', { ancienPassword, nouveauPassword }),

  preparer2FA: async () => {
    const { data } = await api.post('/auth/2fa/preparer')
    return data
  },

  activer2FA: async (codeTotp) => {
    const { data } = await api.post('/auth/2fa/activer', { codeTotp })
    return data
  },

  desactiver2FA: async (password, codeTotp) => {
    const { data } = await api.post('/auth/2fa/desactiver', { password, codeTotp })
    return data
  },
}
