import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../services/api';
import type { User } from '../types';
import { useAuth } from '../hooks/useAuth';

export const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const userData = await userApi.getProfile(id);
        setUser(userData);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Пользователь не найден</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;
  const roleNames: Record<string, string> = {
    STARTUP: 'Стартап',
    SPECIALIST: 'Специалист',
    SME: 'МСП',
    ADMIN: 'Администратор',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{roleNames[user.role]}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-semibold text-lg">{user.reputationPoints}</span>
                  <span className="text-gray-600 text-sm">баллов репутации</span>
                </div>
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <a href="/profile/edit" className="btn-primary">
              Редактировать профиль
            </a>
          )}
        </div>

        {user.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">О себе</h3>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Expertise */}
      {user.expertise && user.expertise.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Области экспертизы</h2>
          <div className="flex flex-wrap gap-2">
            {user.expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Profile Details */}
      {user.profile && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Детали профиля</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.profile.companyName && (
              <>
                <dt className="text-gray-600 text-sm">Компания</dt>
                <dd className="text-gray-900 font-medium">{user.profile.companyName}</dd>
              </>
            )}
            {user.profile.industry && (
              <>
                <dt className="text-gray-600 text-sm">Отрасль</dt>
                <dd className="text-gray-900 font-medium">{user.profile.industry}</dd>
              </>
            )}
            {user.profile.website && (
              <>
                <dt className="text-gray-600 text-sm">Веб-сайт</dt>
                <dd className="text-gray-900 font-medium">
                  <a
                    href={user.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {user.profile.website}
                  </a>
                </dd>
              </>
            )}
            {user.profile.yearsExperience !== null &&
              user.profile.yearsExperience !== undefined && (
                <>
                  <dt className="text-gray-600 text-sm">Опыт работы</dt>
                  <dd className="text-gray-900 font-medium">
                    {user.profile.yearsExperience} лет
                  </dd>
                </>
              )}
            {user.profile.employeeCount && (
              <>
                <dt className="text-gray-600 text-sm">Количество сотрудников</dt>
                <dd className="text-gray-900 font-medium">{user.profile.employeeCount}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      {/* Contact Information */}
      {user.contactInfo && Object.keys(user.contactInfo).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Контактная информация</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <dt className="text-gray-600 text-sm">Email</dt>
            <dd className="text-gray-900 font-medium">
              <a href={`mailto:${user.email}`} className="text-primary-600 hover:underline">
                {user.email}
              </a>
            </dd>
            {Object.entries(user.contactInfo).map(([key, value]) => (
              <>
                <dt key={`${key}-label`} className="text-gray-600 text-sm capitalize">
                  {key}
                </dt>
                <dd key={`${key}-value`} className="text-gray-900 font-medium">
                  {String(value)}
                </dd>
              </>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};
