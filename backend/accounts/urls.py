from django.urls import path

from .views import (
    admin_login_logs,
    bulk_delete_students,
    csrf_token,
    login_view,
    logout_view,
    session_view,
    upload_excel,
    student_profile,
    student_detail,
    students,
    dashboard_stats,
    database_connection,
)

urlpatterns = [
    path('csrf/', csrf_token),

    path('session/', session_view),

    path('logout/', logout_view),

    path('students/bulk-delete/', bulk_delete_students),
    path('students/<str:student_id>/', student_detail),

    path(
        'upload-excel/',
        upload_excel
    ),

    path(
        'login/',
        login_view
    ),

    path(
        'profile/<str:student_id>/',
        student_profile
    ),
    path
    (
        'students/',
        students
    ),
    path(
    'dashboard-stats/',
    dashboard_stats
),
    path(
        'db-connection/',
        database_connection
    ),

    path('admin-login-logs/', admin_login_logs),

]
