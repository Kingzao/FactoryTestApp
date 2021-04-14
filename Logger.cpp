#include "Logger.h"

#include <QDebug>

Logger::Logger(const QSharedPointer<QSettings> &settings, SessionManager *session, QObject *parent)
    : QObject(parent),
      _settings(settings),
      _session(session),
      _logMutex(QMutex::Recursive),
      _debugLogMutex(QMutex::Recursive)
{
    connect(this, &Logger::logDebug, this, &Logger::on_logDebug);
    connect(this, &Logger::logInfo, this, &Logger::on_logInfo);
    connect(this, &Logger::logError, this, &Logger::on_logError);
    connect(this, &Logger::logSuccess, this, &Logger::on_logSuccess);
}

void Logger::setLogWidget(QListWidget *widget)
{
    _logWidget = widget;
}

void Logger::setChildProcessLogWidget(QListWidget *widget)
{
    _debugLogWidget = widget;
}

void Logger::on_logInfo(const QString message)
{
    QMutexLocker locker(&_logMutex);

    if(!_logWidget)
        return;

    QListWidgetItem *item = new QListWidgetItem(message);

    item->setBackground(QBrush(QColor("#9E9E9E")));
    item->setForeground(Qt::white);

    _logWidget->addItem(item);
    _logWidget->scrollToBottom();
    qInfo().noquote() << message;
}

void Logger::on_logError(const QString message)
{
    QMutexLocker locker(&_logMutex);

    if(!_logWidget)
        return;

    QListWidgetItem *item = new QListWidgetItem(message);

    item->setBackground(QBrush(QColor("#e57373")));
    item->setForeground(Qt::white);
    _logWidget->addItem(item);
    _logWidget->scrollToBottom();
    qCritical().noquote() << message;
}

void Logger::on_logSuccess(const QString message)
{
    QMutexLocker locker(&_logMutex);

    if(!_logWidget)
        return;

    QListWidgetItem *item = new QListWidgetItem(message);

    item->setBackground(QBrush(QColor("#81C784")));
    item->setForeground(Qt::white);
    _logWidget->addItem(item);
    _logWidget->scrollToBottom();
    qInfo().noquote() << message;
}

void Logger::on_logDebug(const QString message)
{
    QMutexLocker locker(&_debugLogMutex);

    if(!_debugLogWidget)
        return;

    _debugLogWidget->addItem(message);
    _debugLogWidget->scrollToBottom();
    qInfo().noquote() << message;

    QFile log_file(_settings->value("workDirectory").toString() + "/reports/" + QDateTime::currentDateTime().toString("yyyy-MM-dd") + ".log");

    log_file.open(QIODevice::WriteOnly | QIODevice::Append | QIODevice::Text);

    log_file.write(QDateTime::currentDateTime().toString("hh:mm:ss").toLocal8Bit());
    log_file.write(" " + message.toLocal8Bit());
    log_file.write("\n");
    log_file.close();
}
