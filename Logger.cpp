#include "Logger.h"

#include <QDebug>

Logger::Logger(QObject *parent) : QObject(parent)
{

}

void Logger::setLogWidget(QListWidget *widget)
{
    _logWidget = widget;
}

void Logger::setChildProcessLogWidget(QListWidget *widget)
{
    _childProcessLogWidget = widget;
}

void Logger::logInfo(const QString &message)
{
    if(!_logWidget)
        return;

    _logWidget->addItem(message);
    _logWidget->scrollToBottom();
    qInfo().noquote() << message;
}

void Logger::logError(const QString &message)
{
    if(!_logWidget)
        return;

    QListWidgetItem *item = new QListWidgetItem(message);

    item->setBackground(Qt::darkRed);
    item->setForeground(Qt::white);
    _logWidget->addItem(item);
    _logWidget->scrollToBottom();
    qCritical().noquote() << message;
}

void Logger::logSuccess(const QString &message)
{
    if(!_logWidget)
        return;

    QListWidgetItem *item = new QListWidgetItem(message);

    item->setBackground(Qt::green);
    item->setForeground(Qt::black);
    _logWidget->addItem(item);
    _logWidget->scrollToBottom();
    qInfo().noquote() << message;
}

void Logger::logChildProcessOutput(const QString &message)
{
    if(!_childProcessLogWidget)
        return;

    _childProcessLogWidget->addItem(message);
    _childProcessLogWidget->scrollToBottom();
    qInfo().noquote() << message;
}
