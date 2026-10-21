import { supabase } from './supabase';

/**
 * Academia Authentication Service
 * Handles login/register with lead unification to prevent duplicates
 * Password is the phone number (hashed)
 */

export const academiaAuth = {
    /**
     * Simple hash function for password
     * In production, use bcrypt or Supabase Auth
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    /**
     * Login with email and password
     * Password is the phone number (hashed)
     * @param {string} email 
     * @param {string} password - This should be the phone number
     * @returns {Object} { success, user, error }
     */
    async login(email, password) {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('email', email.toLowerCase())
                .limit(1)
                .single();

            if (error || !data) {
                return {
                    success: false,
                    error: 'No se encontró un usuario con ese email.'
                };
            }

            // If user has a password_hash, compare it
            if (data.password_hash) {
                const hashedInput = this.hashPassword(password);
                if (data.password_hash !== hashedInput) {
                    return {
                        success: false,
                        error: 'Email o contraseña incorrectos.'
                    };
                }
            } else {
                // Legacy: if no password_hash, check if password matches phone
                if (data.phone !== password) {
                    return {
                        success: false,
                        error: 'Email o contraseña incorrectos.'
                    };
                }
            }

            this.setSession(data);

            return {
                success: true,
                user: data
            };
        } catch (err) {
            console.error('Login error:', err);
            return {
                success: false,
                error: 'Error al iniciar sesión. Intenta nuevamente.'
            };
        }
    },

    /**
     * Register new user or update existing lead
     * If email exists, update the lead with new data
     * @param {string} name 
     * @param {string} email 
     * @param {string} phone 
     * @param {string} password 
     * @returns {Object} { success, user, error }
     */
    async register(name, email, phone, password) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPhone = String(phone || '').trim();

        try {
            const { data: existingLead, error: searchError } = await supabase
                .from('leads')
                .select('*')
                .eq('email', normalizedEmail)
                .maybeSingle();

            if (searchError) throw searchError;

            // Los leads de marketing pueden no ser cuentas de Academia todavía.
            if (existingLead?.password_hash) {
                return {
                    success: false,
                    error: 'Este usuario ya está registrado. Iniciá sesión con tu correo y contraseña.'
                };
            }

            if (normalizedPhone) {
                let phoneQuery = supabase
                    .from('leads')
                    .select('id,email')
                    .eq('phone', normalizedPhone);
                if (existingLead?.id) phoneQuery = phoneQuery.neq('id', existingLead.id);
                const { data: phoneOwner, error: phoneError } = await phoneQuery.maybeSingle();
                if (phoneError) throw phoneError;
                if (phoneOwner) {
                    return {
                        success: false,
                        error: 'Ese celular ya está asociado a otra cuenta. Revisá el número o iniciá sesión.'
                    };
                }
            }

            const now = new Date().toISOString();
            const accountData = {
                name: String(name || '').trim(),
                email: normalizedEmail,
                phone: normalizedPhone,
                password_hash: this.hashPassword(String(password || '')),
                updated_at: now
            };

            let data;
            if (existingLead) {
                const { data: updated, error } = await supabase
                    .from('leads')
                    .update(accountData)
                    .eq('id', existingLead.id)
                    .select()
                    .single();
                if (error) throw error;
                data = updated;
            } else {
                const { data: created, error } = await supabase
                    .from('leads')
                    .insert([{
                        ...accountData,
                        status: ['Nuevo'],
                        downloaded_ebook: false,
                        created_at: now
                    }])
                    .select()
                    .single();
                if (error) throw error;
                data = created;
            }

            this.setSession(data);
            return { success: true, user: data, isExisting: Boolean(existingLead), isNew: !existingLead };
        } catch (err) {
            console.error('Register error:', err?.message || err?.code || 'unknown error');
            if (err?.code === '23505') {
                return {
                    success: false,
                    error: 'Ese correo o celular ya está registrado. Iniciá sesión o revisá los datos.'
                };
            }
            if (err instanceof TypeError && /fetch/i.test(err.message || '')) {
                return {
                    success: false,
                    error: 'No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.'
                };
            }
            return {
                success: false,
                error: 'No se pudo completar el registro. Intentá nuevamente en unos minutos.'
            };
        }
    },

    /**
     * Find or create lead (for unified flow)
     * Used when user interacts with site (ebook, appointment)
     * @param {string} email 
     * @param {string} phone 
     * @param {string} name 
     * @returns {Object} { success, user, isNew, error }
     */
    async findOrCreateLead(email, phone, name = null) {
        try {
            // Search for existing lead
            const { data: existingLead, error: searchError } = await supabase
                .from('leads')
                .select('*')
                .eq('email', email.toLowerCase())
                .limit(1)
                .single();

            if (existingLead && !searchError) {
                // Lead exists - update with new data if provided
                const updateData = {};
                if (phone && !existingLead.phone) updateData.phone = phone;
                if (name && !existingLead.name) updateData.name = name;

                if (Object.keys(updateData).length > 0) {
                    updateData.updated_at = new Date().toISOString();

                    const { data, error } = await supabase
                        .from('leads')
                        .update(updateData)
                        .eq('id', existingLead.id)
                        .select()
                        .single();

                    if (error) {
                        console.error('Error updating lead:', error);
                    } else {
                        return {
                            success: true,
                            user: data,
                            isNew: false
                        };
                    }
                }

                return {
                    success: true,
                    user: existingLead,
                    isNew: false
                };
            }

            // Create new lead
            const newLead = {
                name: name || '',
                email: email.toLowerCase(),
                phone: phone || '',
                status: ['Nuevo'],
                downloaded_ebook: false,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('leads')
                .insert([newLead])
                .select()
                .single();

            if (error) {
                console.error('Error creating lead:', error);
                return {
                    success: false,
                    error: 'Error al crear el registro.'
                };
            }

            return {
                success: true,
                user: data,
                isNew: true
            };
        } catch (err) {
            console.error('Find or create lead error:', err);
            return {
                success: false,
                error: 'Error al procesar los datos.'
            };
        }
    },

    /**
     * Update user profile
     * @param {number} userId 
     * @param {Object} data - { name, phone }
     * @returns {Object} { success, error }
     */
    async updateProfile(userId, data) {
        try {
            const updateData = {};

            if (data.name !== undefined) {
                updateData.name = data.name;
            }
            if (data.phone !== undefined) {
                updateData.phone = data.phone;
            }

            if (Object.keys(updateData).length === 0) {
                return { success: true };
            }

            const { error } = await supabase
                .from('leads')
                .update(updateData)
                .eq('id', userId);

            if (error) {
                console.error('Error updating profile:', error);
                return { success: false, error: 'Error al actualizar el perfil.' };
            }

            // Update session storage with new data
            const session = this.getSession();
            if (session) {
                Object.assign(session, updateData);
                this.setSession(session);
            }

            return { success: true };
        } catch (err) {
            console.error('Update profile error:', err);
            return { success: false, error: 'Error al actualizar el perfil.' };
        }
    },

    /**
     * Update password
     * @param {number} userId 
     * @param {string} newPassword 
     * @returns {Object} { success, error }
     */
    async updatePassword(userId, newPassword) {
        try {
            const hashedPassword = this.hashPassword(newPassword);

            const { error } = await supabase
                .from('leads')
                .update({
                    password_hash: hashedPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                console.error('Error updating password:', error);
                return { success: false, error: 'Error al actualizar la contraseña.' };
            }

            return { success: true };
        } catch (err) {
            console.error('Update password error:', err);
            return { success: false, error: 'Error al actualizar la contraseña.' };
        }
    },

    /**
     * Update birth date
     * @param {string} userId 
     * @param {string} birthDate 
     * @returns {Object} { success, error }
     */
    async updateBirthDate(userId, birthDate) {
        try {
            console.log('updateBirthDate called:', { userId, birthDate });
            
            const { data, error } = await supabase
                .from('leads')
                .update({
                    birth_date: birthDate
                })
                .eq('id', userId)
                .select();

            console.log('Supabase response:', { data, error });

            if (error) {
                console.error('Error updating birth date:', error);
                return { success: false, error: error.message || 'Error al guardar la fecha de nacimiento.' };
            }

            return { success: true };
        } catch (err) {
            console.error('Update birth date error:', err);
            return { success: false, error: err.message || 'Error al guardar la fecha de nacimiento.' };
        }
    },

    /**
     * Store user session in localStorage
     * @param {Object} user 
     */
    setSession(user) {
        localStorage.setItem('academia_user', JSON.stringify(user));
    },

    /**
     * Get current session from localStorage
     * @returns {Object|null}
     */
    getSession() {
        try {
            const session = localStorage.getItem('academia_user');
            return session ? JSON.parse(session) : null;
        } catch {
            return null;
        }
    },

    /**
     * Clear session (logout)
     */
    clearSession() {
        localStorage.removeItem('academia_user');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.getSession() !== null;
    }
};
