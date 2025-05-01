import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ChangePasswordForm } from '../components/auth/ChangePasswordForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { ConfirmEmailForm } from '../components/auth/ConfirmEmailForm';
import { SendEmailConfirmationForm } from '../components/auth/SendEmailConfirmationForm';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
            <div className="mt-4">
              <button
                onClick={() => setActiveTab('forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
          <TabsContent value="change-password">
            <ChangePasswordForm />
          </TabsContent>
          <TabsContent value="forgot-password">
            <ForgotPasswordForm />
          </TabsContent>
          <TabsContent value="confirm-email">
            <ConfirmEmailForm />
          </TabsContent>
          <TabsContent value="send-email-confirmation">
            <SendEmailConfirmationForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}; 