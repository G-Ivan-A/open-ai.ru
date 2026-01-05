import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/api';
import { profileUpdateSchema, type ProfileUpdateData } from '../utils/validation';

export const EditProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        bio: user.bio || '',
        avatar: user.avatar || '',
        companyName: user.profile?.companyName || '',
        companySize: user.profile?.companySize || '',
        foundedYear: user.profile?.foundedYear || undefined,
        website: user.profile?.website || '',
        yearsExperience: user.profile?.yearsExperience || undefined,
        businessType: user.profile?.businessType || '',
        industry: user.profile?.industry || '',
        employeeCount: user.profile?.employeeCount || undefined,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileUpdateData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Clean up empty strings and convert to undefined
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? undefined : value,
        ])
      );

      await userApi.updateProfile(cleanedData);
      await refreshUser();
      setSuccess(true);

      setTimeout(() => {
        navigate(`/profile/${user?.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="section-title">Редактирование профиля</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">Профиль успешно обновлен!</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>

          <div className="mb-4">
            <label htmlFor="name" className="label">
              Имя *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="input"
              placeholder="Введите ваше имя"
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="bio" className="label">
              О себе
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={4}
              className="input"
              placeholder="Расскажите о себе"
            />
            {errors.bio && <p className="error-text">{errors.bio.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="avatar" className="label">
              URL аватара
            </label>
            <input
              id="avatar"
              type="url"
              {...register('avatar')}
              className="input"
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatar && <p className="error-text">{errors.avatar.message}</p>}
          </div>
        </div>

        {/* Company Information (for Startups and SME) */}
        {(user.role === 'STARTUP' || user.role === 'SME') && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Информация о компании
            </h2>

            <div className="mb-4">
              <label htmlFor="companyName" className="label">
                Название компании
              </label>
              <input
                id="companyName"
                type="text"
                {...register('companyName')}
                className="input"
                placeholder="ООО Рога и Копыта"
              />
              {errors.companyName && (
                <p className="error-text">{errors.companyName.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="industry" className="label">
                Отрасль
              </label>
              <input
                id="industry"
                type="text"
                {...register('industry')}
                className="input"
                placeholder="IT, Производство, Торговля, и т.д."
              />
              {errors.industry && <p className="error-text">{errors.industry.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="website" className="label">
                Веб-сайт
              </label>
              <input
                id="website"
                type="url"
                {...register('website')}
                className="input"
                placeholder="https://example.com"
              />
              {errors.website && <p className="error-text">{errors.website.message}</p>}
            </div>

            {user.role === 'SME' && (
              <>
                <div className="mb-4">
                  <label htmlFor="businessType" className="label">
                    Тип бизнеса
                  </label>
                  <input
                    id="businessType"
                    type="text"
                    {...register('businessType')}
                    className="input"
                    placeholder="Производство, услуги, торговля"
                  />
                  {errors.businessType && (
                    <p className="error-text">{errors.businessType.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="employeeCount" className="label">
                    Количество сотрудников
                  </label>
                  <input
                    id="employeeCount"
                    type="number"
                    {...register('employeeCount', { valueAsNumber: true })}
                    className="input"
                    placeholder="50"
                  />
                  {errors.employeeCount && (
                    <p className="error-text">{errors.employeeCount.message}</p>
                  )}
                </div>
              </>
            )}

            {user.role === 'STARTUP' && (
              <>
                <div className="mb-4">
                  <label htmlFor="companySize" className="label">
                    Размер команды
                  </label>
                  <input
                    id="companySize"
                    type="text"
                    {...register('companySize')}
                    className="input"
                    placeholder="1-10, 10-50, 50+"
                  />
                  {errors.companySize && (
                    <p className="error-text">{errors.companySize.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="foundedYear" className="label">
                    Год основания
                  </label>
                  <input
                    id="foundedYear"
                    type="number"
                    {...register('foundedYear', { valueAsNumber: true })}
                    className="input"
                    placeholder="2023"
                  />
                  {errors.foundedYear && (
                    <p className="error-text">{errors.foundedYear.message}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Specialist Information */}
        {user.role === 'SPECIALIST' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Профессиональная информация
            </h2>

            <div className="mb-4">
              <label htmlFor="yearsExperience" className="label">
                Опыт работы (лет)
              </label>
              <input
                id="yearsExperience"
                type="number"
                {...register('yearsExperience', { valueAsNumber: true })}
                className="input"
                placeholder="5"
              />
              {errors.yearsExperience && (
                <p className="error-text">{errors.yearsExperience.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/profile/${user.id}`)}
            className="btn-secondary"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};
