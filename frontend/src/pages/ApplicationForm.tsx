import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationApi } from '../services/api';
import { applicationFormSchema, type ApplicationFormData } from '../utils/validation';

export const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      contactName: user?.name || '',
      contactEmail: user?.email || '',
      urgency: 'MEDIUM',
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      // Clean up empty strings
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? undefined : value,
        ])
      );

      await applicationApi.createApplication(cleanedData as any);
      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate('/profile/applications');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Требуется авторизация</h2>
          <p className="text-gray-600 mb-6">
            Для подачи заявки необходимо войти в систему
          </p>
          <a href="/login" className="btn-primary">
            Войти
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title">Хочу подключить ИИ-решение</h1>
      <p className="text-gray-600 mb-8">
        Заполните форму, и наши специалисты свяжутся с вами для обсуждения возможностей
        автоматизации вашего бизнеса.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Контактная информация
          </h2>

          <div className="mb-4">
            <label htmlFor="contactName" className="label">
              Контактное лицо *
            </label>
            <input
              id="contactName"
              type="text"
              {...register('contactName')}
              className="input"
              placeholder="Иван Иванов"
            />
            {errors.contactName && (
              <p className="error-text">{errors.contactName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="contactEmail" className="label">
                Email *
              </label>
              <input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                className="input"
                placeholder="email@example.com"
              />
              {errors.contactEmail && (
                <p className="error-text">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPhone" className="label">
                Телефон
              </label>
              <input
                id="contactPhone"
                type="tel"
                {...register('contactPhone')}
                className="input"
                placeholder="+7 (999) 123-45-67"
              />
              {errors.contactPhone && (
                <p className="error-text">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Информация о бизнесе
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
              Отрасль *
            </label>
            <input
              id="industry"
              type="text"
              {...register('industry')}
              className="input"
              placeholder="Производство, торговля, услуги, и т.д."
            />
            {errors.industry && <p className="error-text">{errors.industry.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="businessDescription" className="label">
              Описание бизнеса/процесса * (минимум 50 символов)
            </label>
            <textarea
              id="businessDescription"
              {...register('businessDescription')}
              rows={4}
              className="input"
              placeholder="Опишите ваш бизнес, основные процессы и задачи..."
            />
            {errors.businessDescription && (
              <p className="error-text">{errors.businessDescription.message}</p>
            )}
          </div>
        </div>

        {/* Automation Goals */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Цели автоматизации
          </h2>

          <div className="mb-4">
            <label htmlFor="automationGoal" className="label">
              Цель автоматизации * (минимум 50 символов)
            </label>
            <textarea
              id="automationGoal"
              {...register('automationGoal')}
              rows={4}
              className="input"
              placeholder="Что вы хотите автоматизировать? Какие задачи решить?"
            />
            {errors.automationGoal && (
              <p className="error-text">{errors.automationGoal.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="targetProcess" className="label">
              Целевой процесс * (минимум 50 символов)
            </label>
            <textarea
              id="targetProcess"
              {...register('targetProcess')}
              rows={4}
              className="input"
              placeholder="Опишите конкретный процесс, который хотите автоматизировать..."
            />
            {errors.targetProcess && (
              <p className="error-text">{errors.targetProcess.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="expectedResults" className="label">
              Ожидаемые результаты
            </label>
            <textarea
              id="expectedResults"
              {...register('expectedResults')}
              rows={3}
              className="input"
              placeholder="Какие результаты вы хотите получить от автоматизации?"
            />
            {errors.expectedResults && (
              <p className="error-text">{errors.expectedResults.message}</p>
            )}
          </div>
        </div>

        {/* Budget and Timeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Бюджет и сроки</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="budget" className="label">
                Бюджет
              </label>
              <input
                id="budget"
                type="text"
                {...register('budget')}
                className="input"
                placeholder="100-500 тыс. руб."
              />
              {errors.budget && <p className="error-text">{errors.budget.message}</p>}
            </div>

            <div>
              <label htmlFor="timeline" className="label">
                Желаемые сроки
              </label>
              <input
                id="timeline"
                type="text"
                {...register('timeline')}
                className="input"
                placeholder="1-3 месяца"
              />
              {errors.timeline && <p className="error-text">{errors.timeline.message}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="urgency" className="label">
              Срочность
            </label>
            <select id="urgency" {...register('urgency')} className="input">
              <option value="LOW">Низкая</option>
              <option value="MEDIUM">Средняя</option>
              <option value="HIGH">Высокая</option>
              <option value="URGENT">Срочно</option>
            </select>
            {errors.urgency && <p className="error-text">{errors.urgency.message}</p>}
          </div>
        </div>

        {/* Additional Comments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Дополнительная информация
          </h2>

          <div className="mb-4">
            <label htmlFor="additionalComments" className="label">
              Дополнительные комментарии
            </label>
            <textarea
              id="additionalComments"
              {...register('additionalComments')}
              rows={4}
              className="input"
              placeholder="Любая дополнительная информация, которая может быть полезна..."
            />
            {errors.additionalComments && (
              <p className="error-text">{errors.additionalComments.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary"
            disabled={submitting}
          >
            Очистить форму
          </button>
        </div>
      </form>
    </div>
  );
};
