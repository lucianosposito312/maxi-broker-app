import React, { useState } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Hero from '../components/features/Hero';
import About from '../components/features/About';
import Ebook from '../components/features/Ebook';
import Projects from '../components/features/Projects';
import Scheduler from '../components/features/Scheduler';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { usePageTracking } from '../hooks/usePageTracking';

const Home = () => {
    usePageTracking();
    const { userData, isUserRegistered, saveUserData, markEbookDownloaded } = useUser();
    const [pendingAppointment, setPendingAppointment] = useState(null);
    const [schedulerStatus, setSchedulerStatus] = useState('idle'); // idle, success

    const handleSchedule = async (appointmentData) => {
        if (appointmentData === null) {
            setSchedulerStatus('idle');
            setPendingAppointment(null);
            return;
        }

        // Check if user is already registered (data in context)
        if (isUserRegistered()) {
            try {
                // Save appointment directly since we have user data
                const leadData = {
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    status: 'Contacted',
                    downloaded_ebook: true,
                    appointment_date: appointmentData.date,
                    appointment_time: appointmentData.time,
                    project_interest: appointmentData.project
                };

                const { error } = await supabase.from('leads').insert([leadData]);
                if (error) throw error;

                setSchedulerStatus('success');
            } catch (err) {
                console.error('Error saving direct appointment:', err);
                alert('No se pudo agendar la cita. Por favor intenta de nuevo.');
            }
        } else {
            // Flow A: User not registered. Set pending and scroll to Ebook.
            setPendingAppointment(appointmentData);
            const ebookSection = document.getElementById('ebook');
            if (ebookSection) {
                ebookSection.scrollIntoView({ behavior: 'smooth' });
                // We could also focus the name input if we want
                setTimeout(() => {
                    document.getElementById('name')?.focus();
                }, 800);
            }
        }
    };

    const handleLeadSubmit = async (formData) => {
        try {
            // Check if user already exists by email
            const { data: existingLeads, error: searchError } = await supabase
                .from('leads')
                .select('*')
                .eq('email', formData.email.toLowerCase())
                .limit(1);

            if (searchError) throw searchError;

            const userAlreadyExists = existingLeads && existingLeads.length > 0;

            if (userAlreadyExists) {
                // User exists - Save to context so they are recognized as "registered"
                const existingUser = existingLeads[0];
                saveUserData(existingUser);
                markEbookDownloaded();

                // If they were just downloading the ebook (no appointment pending)
                if (!pendingAppointment) {
                    alert('Ya te encuentras registrado en nuestra base de datos. ¡Puedes volver a descargar el ebook!');
                }
            }

            const leadData = {
                ...formData,
                email: formData.email.toLowerCase(),
                status: userAlreadyExists ? 'Contacted' : 'New',
                downloaded_ebook: true,
                appointment_date: pendingAppointment ? pendingAppointment.date : null,
                appointment_time: pendingAppointment ? pendingAppointment.time : null,
                project_interest: pendingAppointment ? pendingAppointment.project : null
            };

            // If it's a new user OR an existing user trying to schedule a pending appointment
            // (We always insert if there's a pending appointment to record the event)
            if (!userAlreadyExists || pendingAppointment) {
                const { error } = await supabase.from('leads').insert([leadData]);
                if (error) throw error;
            }

            // Always save to context to enable the "identified user" state
            saveUserData(formData);
            markEbookDownloaded();

            if (pendingAppointment) {
                setSchedulerStatus('success');
                setPendingAppointment(null);

                setTimeout(() => {
                    const schedulerSection = document.getElementById('scheduler');
                    if (schedulerSection) {
                        schedulerSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 1500);
            }

        } catch (err) {
            console.error('Error handling lead submission:', err);
            alert('Hubo un problema al procesar sus datos. Por favor revise el formulario.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Hero />
                <About />
                <Projects />
                <Ebook
                    pendingAppointment={pendingAppointment}
                    onLeadSubmit={handleLeadSubmit}
                />
                <Scheduler
                    onSchedule={handleSchedule}
                    pendingAppointment={pendingAppointment}
                    status={schedulerStatus}
                />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
