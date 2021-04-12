#ifndef PORTMANAGER_H
#define PORTMANAGER_H

#include <QSerialPort>
#include <QSharedPointer>

#include "SlipProtocol.h"
#include "Logger.h"

class PortManager : public QObject
{
    Q_OBJECT

public:

    enum Mode {idleMode, railMode, slipMode};

    explicit PortManager(QObject *parent = nullptr);

    void setPort(const QString &name,
                 qint32 baudRate = QSerialPort::Baud115200,
                 QSerialPort::DataBits dataBits = QSerialPort::Data8,
                 QSerialPort::Parity parity = QSerialPort::NoParity,
                 QSerialPort::StopBits stopBits = QSerialPort::OneStop,
                 QSerialPort::FlowControl flowControl = QSerialPort::NoFlowControl);

    void setLogger(const QSharedPointer<Logger>& logger) {_logger = logger;}

public slots:

    void open();
    void close();

    QStringList slipCommand(int channel, const QByteArray &frame);
    QStringList railtestCommand(int channel, const QByteArray &cmd);

    void setTimeout(int value) {_timeout = value;}

signals:

//    void responseRecieved(QStringList response);

private slots:

    void onSerialPortReadyRead();
    void onSerialPortErrorOccurred(QSerialPort::SerialPortError errorCode);
    void sendFrame(int channel, const QByteArray &frame) Q_DECL_NOTHROW;
    void processResponsePacket();
    void decodeFrame() Q_DECL_NOTHROW;
    void onSlipPacketReceived(quint8 channel, QByteArray frame) Q_DECL_NOTHROW;
    void decodeRailtestReply(const QByteArray &reply);
    void waitCommandFinished();

private:

    QSharedPointer<Logger> _logger;
    QSerialPort _serial;
    int _currentChannelWaitReply = -1;
    uint8_t _currentSequence;

    bool _frameStarted;
    QByteArray _recvBuffer;

    QByteArray _syncCommand;
    QVariantList _syncReplies;

    QStringList _response;
    int _timeout = 10000;

    QByteArray _railReply[4];
};

#endif // PORTMANAGER_H
